import { readdirSync, statSync } from "node:fs";
import path from "node:path";

import type { BlockKitStory, GeneratedBlockKitUrl } from "./types";

/**
 * Block Kit JSONをBlock Kit Builder URLに変換
 */
export function generateBlockKitUrl(
  workspaceId: string,
  payload: unknown,
): string {
  // payloadがblocks配列の場合は { blocks: payload } でラップ
  let normalizedPayload = payload;
  if (Array.isArray(payload)) {
    normalizedPayload = { blocks: payload };
  }

  const encodedPayload = encodeURIComponent(JSON.stringify(normalizedPayload));
  return `https://api.slack.com/tools/block-kit-builder#${encodedPayload}`;
}

/**
 * Block Kit JSONかどうかをチェック
 */
export function isBlockKitJson(obj: unknown): boolean {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }

  const blockKit = obj as Record<string, unknown>;

  return (
    ("type" in blockKit &&
      (blockKit.type === "modal" ||
        blockKit.type === "home" ||
        blockKit.type === "message")) ||
    "blocks" in blockKit ||
    "attachments" in blockKit
  );
}

/**
 * ストーリーからBlock Kit URLを生成
 */
export function createUrlFromStory(
  story: BlockKitStory,
  filePath: string,
  workspaceId: string,
  logger?: {
    warn: (message: string) => void;
    log: (message: string) => void;
  },
  customArgs?: Record<string, unknown>,
): GeneratedBlockKitUrl {
  try {
    // args が指定されている場合は customArgs または story.args を使用
    const args = customArgs ?? story.args;
    const blockKitJson = args ? story.component(args) : story.component();

    if (!isBlockKitJson(blockKitJson)) {
      logger?.warn(`[WARNING] ${story.name} はBlock Kit JSONではありません`);
    }

    const url = generateBlockKitUrl(workspaceId, blockKitJson);

    return {
      filePath,
      storyName: story.name,
      description: story.description,
      url,
      blockKitJson,
      tags: story.tags,
      args: story.args,
      argTypes: story.argTypes,
    };
  } catch (err) {
    return {
      filePath,
      storyName: story.name,
      description: story.description,
      url: "",
      error: err instanceof Error ? err.message : "Unknown error",
      tags: story.tags,
      args: story.args,
      argTypes: story.argTypes,
    };
  }
}

/**
 * ディレクトリを再帰的に検索して指定拡張子のファイルを見つける
 */
export function findBlockKitFiles(
  dir: string,
  fileExtension: string,
): string[] {
  const results: string[] = [];

  try {
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      try {
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          results.push(...findBlockKitFiles(fullPath, fileExtension));
        } else if (stat.isFile() && entry.endsWith(fileExtension)) {
          results.push(fullPath);
        }
      } catch {
        // スキップ
      }
    }
  } catch {
    // スキップ
  }

  return results;
}

/**
 * 全ての.blockkit.tsxファイルからストーリーを収集
 */
export async function collectAllStories(
  searchDir: string,
  fileExtension: string,
  workspaceId: string,
  logger?: {
    error: (message: string, err?: unknown) => void;
    log: (message: string) => void;
    warn: (message: string) => void;
  },
): Promise<GeneratedBlockKitUrl[]> {
  const blockKitFiles = findBlockKitFiles(searchDir, fileExtension);

  const generatedUrls: GeneratedBlockKitUrl[] = [];

  for (const filePath of blockKitFiles) {
    try {
      // 動的インポート（キャッシュバスティングのためタイムスタンプとランダム値を追加）
      // ESMのモジュールキャッシュを確実に回避するため、複数のパラメータを使用
      const cacheBuster = `t=${Date.now()}&r=${Math.random().toString(36).slice(2)}`;
      const importUrl = `${filePath}?${cacheBuster}`;

      logger?.log(`🔄 Importing: ${importUrl}`);
      const mod = await import(importUrl);
      logger?.log(`✅ Import completed: ${filePath}`);

      if (!mod.stories || !Array.isArray(mod.stories)) {
        continue;
      }

      const stories = mod.stories as BlockKitStory[];
      logger?.log(`📦 Found ${stories.length} story(s): ${filePath}`);

      for (const story of stories) {
        const url = createUrlFromStory(story, filePath, workspaceId, logger);
        generatedUrls.push(url);
      }
    } catch (err) {
      logger?.error(
        `Error loading ${filePath}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  return generatedUrls;
}

/**
 * 特定のストーリーをカスタム args で再レンダリング
 */
export async function renderStoryWithArgs(
  filePath: string,
  storyName: string,
  args: Record<string, unknown>,
  workspaceId: string,
  logger?: {
    log: (message: string) => void;
    warn: (message: string) => void;
    error: (message: string, ...args: unknown[]) => void;
  },
  baseDir?: string,
): Promise<{ blockKitJson?: unknown; url?: string; error?: string }> {
  try {
    // 相対パスを絶対パスに変換
    const absolutePath = baseDir ? path.resolve(baseDir, filePath) : filePath;

    // 動的インポート（キャッシュバスティング）
    const cacheBuster = `t=${Date.now()}&r=${Math.random().toString(36).slice(2)}`;
    const importUrl = `${absolutePath}?${cacheBuster}`;

    logger?.log(`🔄 Importing for re-render: ${importUrl}`);
    const mod = await import(importUrl);

    if (!mod.stories || !Array.isArray(mod.stories)) {
      return { error: "No stories found in file" };
    }

    const story = mod.stories.find((s: BlockKitStory) => s.name === storyName);

    if (!story) {
      return { error: `Story "${storyName}" not found` };
    }

    // args を使ってコンポーネントをレンダリング
    const blockKitJson = story.component(args);

    if (!isBlockKitJson(blockKitJson)) {
      logger?.warn(`[WARNING] ${story.name} is not valid Block Kit JSON`);
    }

    const url = generateBlockKitUrl(workspaceId, blockKitJson);

    return { blockKitJson, url };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

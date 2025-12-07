import { readdirSync, statSync } from "node:fs";
import path from "node:path";

import type { BlockKitStory, GeneratedBlockKitUrl } from "./types";

/**
 * Convert Block Kit JSON to Block Kit Builder URL
 */
export function generateBlockKitUrl(
  workspaceId: string,
  payload: unknown,
): string {
  // Wrap payload in { blocks: payload } if it's a blocks array
  let normalizedPayload = payload;
  if (Array.isArray(payload)) {
    normalizedPayload = { blocks: payload };
  }

  const encodedPayload = encodeURIComponent(JSON.stringify(normalizedPayload));
  return `https://api.slack.com/tools/block-kit-builder#${encodedPayload}`;
}

/**
 * Check if the object is a valid Block Kit JSON
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
 * Generate Block Kit URL from a story
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
    // Use customArgs or story.args if args is specified
    const args = customArgs ?? story.args;
    const blockKitJson = args ? story.component(args) : story.component();

    if (!isBlockKitJson(blockKitJson)) {
      logger?.warn(`[WARNING] ${story.name} is not valid Block Kit JSON`);
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
 * Recursively search directory to find files with specified extension
 */
export function findBlockKitFiles(
  dir: string,
  fileExtension: string,
): string[] {
  const results: string[] = [];
  const ignoreDirs = ["node_modules", ".git", "dist", ".next", ".nuxt"];

  try {
    const entries = readdirSync(dir);

    for (const entry of entries) {
      if (ignoreDirs.includes(entry)) {
        continue;
      }

      const fullPath = path.join(dir, entry);
      try {
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          results.push(...findBlockKitFiles(fullPath, fileExtension));
        } else if (stat.isFile() && entry.endsWith(fileExtension)) {
          results.push(fullPath);
        }
      } catch {
        // skip
      }
    }
  } catch {
    // skip
  }

  return results;
}

/**
 * Collect stories from all .blockkit.tsx files
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
      // Dynamic import with cache busting (timestamp and random value)
      // Using multiple parameters to ensure ESM module cache is bypassed
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
 * Re-render a specific story with custom args
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
    // Convert relative path to absolute path
    const absolutePath = baseDir ? path.resolve(baseDir, filePath) : filePath;

    // Dynamic import with cache busting
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

    // Render component with args
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

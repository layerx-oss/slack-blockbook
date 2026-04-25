import { readdirSync, statSync } from "node:fs";
import path from "node:path";

import { createJiti, type Jiti } from "jiti";

import { IGNORED_DIRECTORIES } from "./config";
import type { BlockKitStory, GeneratedBlockKitUrl, Logger } from "./types";
import { isBlockKitStoryArray, isNonNullObject } from "./types";

let jitiInstance: Jiti | null = null;

function getJiti(): Jiti {
  if (!jitiInstance) {
    jitiInstance = createJiti(import.meta.url, {
      interopDefault: true,
      moduleCache: false,
      jsx: { runtime: "automatic" },
    });
  }
  return jitiInstance;
}

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
  // Support array of blocks (jsx-slack returns this format)
  if (Array.isArray(obj)) {
    return obj.length > 0 && obj.every((item) => isNonNullObject(item) && "type" in item);
  }

  if (!isNonNullObject(obj)) {
    return false;
  }

  return (
    ("type" in obj &&
      (obj.type === "modal" ||
        obj.type === "home" ||
        obj.type === "message")) ||
    "blocks" in obj ||
    "attachments" in obj
  );
}

/**
 * Generate cache buster string for ESM module cache bypass
 */
export function generateCacheBuster(): string {
  return `t=${Date.now()}&r=${Math.random().toString(36).slice(2)}`;
}

/**
 * Generate Block Kit URL from a story
 */
export function createUrlFromStory(
  story: BlockKitStory,
  filePath: string,
  workspaceId: string,
  logger?: Pick<Logger, "warn" | "log">,
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

  try {
    const entries = readdirSync(dir);

    for (const entry of entries) {
      if ((IGNORED_DIRECTORIES as readonly string[]).includes(entry)) {
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
  logger?: Logger,
): Promise<GeneratedBlockKitUrl[]> {
  const blockKitFiles = findBlockKitFiles(searchDir, fileExtension);

  const generatedUrls: GeneratedBlockKitUrl[] = [];
  const jiti = getJiti();

  for (const filePath of blockKitFiles) {
    try {
      logger?.log(`🔄 Importing: ${filePath}`);
      const mod = (await jiti.import(filePath)) as Record<string, unknown>;
      logger?.log(`✅ Import completed: ${filePath}`);

      if (!isBlockKitStoryArray(mod.stories)) {
        continue;
      }

      const stories = mod.stories;
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
  logger?: Logger,
  baseDir?: string,
): Promise<{ blockKitJson?: unknown; url?: string; error?: string }> {
  try {
    // Convert relative path to absolute path
    const absolutePath = baseDir ? path.resolve(baseDir, filePath) : filePath;

    const jiti = getJiti();
    logger?.log(`🔄 Importing for re-render: ${absolutePath}`);
    const mod = (await jiti.import(absolutePath)) as Record<string, unknown>;

    if (!isBlockKitStoryArray(mod.stories)) {
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

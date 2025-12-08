import { writeFileSync } from "node:fs";
import path from "node:path";

import { DEFAULT_FILE_EXTENSION } from "./config";
import type {
  BlockKitGeneratorConfig,
  GeneratedBlockKitUrl,
} from "./types";
import { isBlockKitStoryArray } from "./types";
import { createUrlFromStory, findBlockKitFiles, isBlockKitJson } from "./utils";

/**
 * Output generated URLs in markdown format
 */
function generateMarkdown(
  urls: GeneratedBlockKitUrl[],
  baseDir: string,
  timestamp: string,
): string {
  let markdown = `# Slack Block Kit Builder URLs\n\n`;
  markdown += `Generated: ${timestamp}\n\n`;

  // Group by file path
  const groupedByFile: Record<string, GeneratedBlockKitUrl[]> = {};
  for (const url of urls) {
    const existing = groupedByFile[url.filePath];
    if (existing) {
      existing.push(url);
    } else {
      groupedByFile[url.filePath] = [url];
    }
  }

  let successCount = 0;
  let errorCount = 0;

  // Output for each file
  for (const [filePath, fileUrls] of Object.entries(groupedByFile)) {
    const relativePath = path.relative(baseDir, filePath);
    markdown += `## ${relativePath}\n\n`;

    for (const urlData of fileUrls) {
      markdown += `### ${urlData.storyName}\n\n`;

      if (urlData.description) {
        markdown += `${urlData.description}\n\n`;
      }

      if (urlData.tags && urlData.tags.length > 0) {
        markdown += `Tags: ${urlData.tags.map((tag) => `\`${tag}\``).join(", ")}\n\n`;
      }

      if (urlData.error) {
        markdown += `⚠️ Error: ${urlData.error}\n\n`;
        errorCount++;
      } else {
        markdown += `[Block Kit Builderで開く](${urlData.url})\n\n`;
        successCount++;
      }
    }

    markdown += `---\n\n`;
  }

  // Statistics
  markdown += `## Statistics\n\n`;
  markdown += `- Files processed: ${Object.keys(groupedByFile).length}\n`;
  markdown += `- URLs generated: ${successCount}\n`;
  markdown += `- Errors: ${errorCount}\n`;

  return markdown;
}

/**
 * Generate Block Kit Builder URLs to markdown file
 */
export async function generateBlockKitUrls(
  config: BlockKitGeneratorConfig,
): Promise<void> {
  const fileExtension = config.fileExtension ?? DEFAULT_FILE_EXTENSION;
  const baseDir = config.baseDir ?? process.cwd();

  console.log(`🔍 Searching for ${fileExtension} files...`);

  const blockKitFiles = findBlockKitFiles(config.searchDir, fileExtension);

  console.log(`✅ Found ${blockKitFiles.length} file(s)\n`);

  if (blockKitFiles.length === 0) {
    console.log(`⚠️  No ${fileExtension} files found`);
    console.log(`   Example: WorkflowLoadingModal${fileExtension}`);
    return;
  }

  const generatedUrls: GeneratedBlockKitUrl[] = [];

  // Process each .blockkit.tsx file
  for (const filePath of blockKitFiles) {
    const relativePath = path.relative(baseDir, filePath);
    console.log(`📄 Processing ${relativePath}...`);

    try {
      // Dynamic import
      const module = await import(filePath);

      if (!isBlockKitStoryArray(module.stories)) {
        console.log(
          `  ⚠️  ${relativePath} has no stories export`,
        );
        continue;
      }

      const stories = module.stories;
      console.log(`  Found ${stories.length} story(s)`);

      // Process each story
      for (const story of stories) {
        console.log(`  - Processing ${story.name}...`);
        const url = createUrlFromStory(story, filePath, config.workspaceId, {
          warn: (message: string) => console.warn(`    ${message}`),
          log: (message: string) => console.log(`    ${message}`),
        });
        generatedUrls.push(url);

        // Display Block Kit JSON validation result
        try {
          const blockKitJson = story.component();
          if (isBlockKitJson(blockKitJson)) {
            console.log(
              `    [SUCCESS] ${story.name} is valid Block Kit JSON`,
            );
          } else {
            console.log(
              `    [WARNING] ${story.name} may not be valid Block Kit JSON`,
            );
          }
        } catch {
          // Error is already stored in url.error
        }
      }

      console.log(`✅ Completed processing ${relativePath}\n`);
    } catch (err) {
      console.error(
        `❌ Failed to process ${relativePath}:`,
        err instanceof Error ? err.message : err,
      );
      console.error("");
    }
  }

  if (generatedUrls.length === 0) {
    console.log("⚠️  No URLs generated");
    return;
  }

  console.log(`\n📝 Generating markdown file...`);

  // Get current time
  const now = new Date();
  const timestamp = now.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // Generate markdown
  const markdown = generateMarkdown(generatedUrls, baseDir, timestamp);

  // Write to file
  writeFileSync(config.outputPath, markdown, "utf8");

  console.log(`✅ Markdown file generated: ${config.outputPath}`);
  console.log(
    `\n📊 Stats: Generated ${generatedUrls.filter((u) => !u.error).length} URL(s)`,
  );
}

import { writeFileSync } from "node:fs";
import path from "node:path";

import type {
  BlockKitGeneratorConfig,
  BlockKitStory,
  GeneratedBlockKitUrl,
} from "./types";
import { createUrlFromStory, findBlockKitFiles, isBlockKitJson } from "./utils";

const DEFAULT_FILE_EXTENSION = ".blockkit.tsx";

/**
 * 生成されたURLをマークダウン形式で出力
 */
function generateMarkdown(
  urls: GeneratedBlockKitUrl[],
  baseDir: string,
  timestamp: string,
): string {
  let markdown = `# Slack Block Kit Builder URLs\n\n`;
  markdown += `生成日時: ${timestamp}\n\n`;

  // ファイルパスでグループ化
  const groupedByFile: Record<string, GeneratedBlockKitUrl[]> = {};
  for (const url of urls) {
    if (!groupedByFile[url.filePath]) {
      groupedByFile[url.filePath] = [];
    }
    groupedByFile[url.filePath]!.push(url);
  }

  let successCount = 0;
  let errorCount = 0;

  // ファイルごとに出力
  for (const [filePath, fileUrls] of Object.entries(groupedByFile)) {
    const relativePath = path.relative(baseDir, filePath);
    markdown += `## ${relativePath}\n\n`;

    for (const urlData of fileUrls) {
      markdown += `### ${urlData.storyName}\n\n`;

      if (urlData.description) {
        markdown += `${urlData.description}\n\n`;
      }

      if (urlData.tags && urlData.tags.length > 0) {
        markdown += `タグ: ${urlData.tags.map((tag) => `\`${tag}\``).join(", ")}\n\n`;
      }

      if (urlData.error) {
        markdown += `⚠️ エラー: ${urlData.error}\n\n`;
        errorCount++;
      } else {
        markdown += `[Block Kit Builderで開く](${urlData.url})\n\n`;
        successCount++;
      }
    }

    markdown += `---\n\n`;
  }

  // 統計情報
  markdown += `## 統計情報\n\n`;
  markdown += `- 処理ファイル数: ${Object.keys(groupedByFile).length}\n`;
  markdown += `- 生成URL数: ${successCount}\n`;
  markdown += `- エラー数: ${errorCount}\n`;

  return markdown;
}

/**
 * Block Kit Builder URLをマークダウンファイルに生成
 */
export async function generateBlockKitUrls(
  config: BlockKitGeneratorConfig,
): Promise<void> {
  const fileExtension = config.fileExtension ?? DEFAULT_FILE_EXTENSION;
  const baseDir = config.baseDir ?? process.cwd();

  console.log(`🔍 ${fileExtension} ファイルを検索中...`);

  const blockKitFiles = findBlockKitFiles(config.searchDir, fileExtension);

  console.log(`✅ ${blockKitFiles.length}個のファイルを発見しました\n`);

  if (blockKitFiles.length === 0) {
    console.log(`⚠️  ${fileExtension} ファイルが見つかりませんでした`);
    console.log(`   例: WorkflowLoadingModal${fileExtension}`);
    return;
  }

  const generatedUrls: GeneratedBlockKitUrl[] = [];

  // 各.blockkit.tsxファイルを処理
  for (const filePath of blockKitFiles) {
    const relativePath = path.relative(baseDir, filePath);
    console.log(`📄 ${relativePath} を処理中...`);

    try {
      // 動的インポート
      const module = await import(filePath);

      if (!module.stories || !Array.isArray(module.stories)) {
        console.log(
          `  ⚠️  ${relativePath} には stories エクスポートがありません`,
        );
        continue;
      }

      const stories = module.stories as BlockKitStory[];
      console.log(`  見つかったストーリー: ${stories.length}個`);

      // 各ストーリーを処理
      for (const story of stories) {
        console.log(`  - ${story.name} を処理中...`);
        const url = createUrlFromStory(story, filePath, config.workspaceId, {
          warn: (message: string) => console.warn(`    ${message}`),
          log: (message: string) => console.log(`    ${message}`),
        });
        generatedUrls.push(url);

        // Block Kit JSONのバリデーション結果を表示
        try {
          const blockKitJson = story.component();
          if (isBlockKitJson(blockKitJson)) {
            console.log(
              `    [SUCCESS] ${story.name} は有効なBlock Kit JSONです`,
            );
          } else {
            console.log(
              `    [WARNING] ${story.name} はBlock Kit JSONではないかもしれません`,
            );
          }
        } catch {
          // エラーは既に url.error に格納されている
        }
      }

      console.log(`✅ ${relativePath} の処理が完了しました\n`);
    } catch (err) {
      console.error(
        `❌ ${relativePath} の処理に失敗:`,
        err instanceof Error ? err.message : err,
      );
      console.error("");
    }
  }

  if (generatedUrls.length === 0) {
    console.log("⚠️  URLを生成できませんでした");
    return;
  }

  console.log(`\n📝 マークダウンファイルを生成中...`);

  // 現在時刻を取得
  const now = new Date();
  const timestamp = now.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // マークダウンを生成
  const markdown = generateMarkdown(generatedUrls, baseDir, timestamp);

  // ファイルに書き出し
  writeFileSync(config.outputPath, markdown, "utf8");

  console.log(`✅ マークダウンファイルを生成しました: ${config.outputPath}`);
  console.log(
    `\n📊 統計: ${generatedUrls.filter((u) => !u.error).length}個のURLを生成しました`,
  );
}

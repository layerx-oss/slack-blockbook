/**
 * Block Kit Preview HTML生成
 */

import path from "node:path";

import type { GeneratedBlockKitUrl } from "../types";

import { generateClientScript } from "./client-script";
import { styles } from "./styles";

interface StoryData {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  url: string;
  blockKitJson?: unknown;
  error?: string;
  filePath: string;
  args?: Record<string, unknown>;
  argTypes?: Record<string, unknown>;
}

/**
 * HTMLページを生成
 */
export function generateHtmlPage(
  urls: GeneratedBlockKitUrl[],
  baseDir: string,
  projectName: string,
  fileExtension: string,
): string {
  // ファイルパスでグループ化
  const groupedByFile: Record<string, GeneratedBlockKitUrl[]> = {};
  for (const url of urls) {
    if (!groupedByFile[url.filePath]) {
      groupedByFile[url.filePath] = [];
    }
    groupedByFile[url.filePath]!.push(url);
  }

  // サイドバーのファイルツリーを生成
  const sidebarItems = Object.entries(groupedByFile)
    .map(([filePath, fileUrls]) => {
      const relativePath = path.relative(baseDir, filePath);
      const fileName = path.basename(relativePath, fileExtension);
      const fileId = relativePath.replaceAll(/[^a-zA-Z\d]/g, "_");

      const storyItems = fileUrls
        .map((urlData, index) => {
          const storyId = `${fileId}_${index}`;
          return `
          <li class="story-item" data-story-id="${storyId}">
            <span class="story-icon">📄</span>
            <span class="story-name">${urlData.storyName}</span>
          </li>
        `;
        })
        .join("");

      return `
      <li class="file-item">
        <div class="file-header" data-file-id="${fileId}">
          <span class="folder-icon">📁</span>
          <span class="file-name">${fileName}</span>
        </div>
        <ul class="story-list">
          ${storyItems}
        </ul>
      </li>
    `;
    })
    .join("");

  // ストーリー詳細データをJSON化
  const storyData: StoryData[] = Object.entries(groupedByFile).flatMap(
    ([filePath, fileUrls]) => {
      const relativePath = path.relative(baseDir, filePath);
      const fileId = relativePath.replaceAll(/[^a-zA-Z\d]/g, "_");

      return fileUrls.map((urlData, index) => {
        const storyId = `${fileId}_${index}`;
        return {
          id: storyId,
          name: urlData.storyName,
          description: urlData.description,
          tags: urlData.tags,
          url: urlData.url,
          blockKitJson: urlData.blockKitJson,
          error: urlData.error,
          filePath: relativePath,
          args: urlData.args,
          argTypes: urlData.argTypes,
        };
      });
    },
  );

  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Slack Block Book - ${projectName}</title>
  <style>
${styles}
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <div class="logo">
      <svg class="logo-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Top row blocks -->
        <rect x="2" y="2" width="8" height="8" rx="1.5" fill="#36C5F0"/>
        <rect x="12" y="2" width="8" height="8" rx="1.5" fill="#2EB67D"/>
        <rect x="22" y="2" width="8" height="8" rx="1.5" fill="#E01E5A"/>

        <!-- Middle row blocks -->
        <rect x="2" y="12" width="8" height="8" rx="1.5" fill="#ECB22E"/>
        <rect x="12" y="12" width="8" height="8" rx="1.5" fill="#4A154B"/>
        <rect x="22" y="12" width="8" height="8" rx="1.5" fill="#36C5F0"/>

        <!-- Bottom row blocks -->
        <rect x="2" y="22" width="8" height="8" rx="1.5" fill="#2EB67D"/>
        <rect x="12" y="22" width="8" height="8" rx="1.5" fill="#E01E5A"/>
        <rect x="22" y="22" width="8" height="8" rx="1.5" fill="#ECB22E"/>
      </svg>
      <span>Slack Block Book</span>
    </div>
    <div class="header-divider"></div>
    <div class="project-name">${projectName}</div>
  </div>

  <!-- App Layout -->
  <div class="app-layout">
    <!-- Sidebar -->
    <div class="sidebar" id="sidebar">
      <div class="sidebar-resizer" id="sidebar-resizer"></div>
      <div class="sidebar-header">Components</div>
      <ul class="file-list">
        ${sidebarItems}
      </ul>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <div class="canvas-toolbar">
        <div class="canvas-title">Canvas</div>
        <div class="stats-badge">
          <div class="stat-badge">
            <span>📁</span>
            <span>${Object.keys(groupedByFile).length} files</span>
          </div>
          <div class="stat-badge">
            <span>📄</span>
            <span>${urls.filter((u) => !u.error).length} stories</span>
          </div>
          ${
            urls.some((u) => u.error)
              ? `
          <div class="stat-badge">
            <span>⚠️</span>
            <span>${urls.filter((u) => u.error).length} errors</span>
          </div>
          `
              : ""
          }
        </div>
      </div>

      <div class="canvas">
        ${
          urls.length > 0
            ? `
        <div id="variant-display">
          <div class="empty-canvas">
            <div class="empty-icon">👈</div>
            <div class="empty-title">バリアントを選択してください</div>
            <div class="empty-description">
              左のサイドバーからコンポーネントを選択すると、Block Kit Builder URLが表示されます
            </div>
          </div>
        </div>
        `
            : `
        <div class="empty-canvas">
          <div class="empty-icon">🔍</div>
          <div class="empty-title">${fileExtension} ファイルが見つかりません</div>
          <div class="empty-description">
            検索ディレクトリ内に
            <span class="empty-code">${fileExtension}</span> ファイルを作成してください
          </div>
        </div>
        `
        }
      </div>
    </div>
  </div>

  <script>
${generateClientScript(storyData)}
  </script>
</body>
</html>
  `;
}

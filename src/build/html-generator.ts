import path from "node:path";

import { escapeHtml } from "../sanitize";
import {
  buildStoryTree,
  renderTreeNode,
  type StoryData,
} from "../templates/html-generator";
import { generateStaticClientScript } from "../templates/static-client-script";
import { styles } from "../templates/styles";
import type { GeneratedBlockKitUrl } from "../types";

export function generateStaticHtmlPage(
  urls: GeneratedBlockKitUrl[],
  baseDir: string,
  projectName: string,
  fileExtension: string,
  workspaceId: string,
  bundleJs: string,
): string {
  const groupedByFile: Record<string, GeneratedBlockKitUrl[]> = {};
  for (const url of urls) {
    const existing = groupedByFile[url.filePath];
    if (existing) {
      existing.push(url);
    } else {
      groupedByFile[url.filePath] = [url];
    }
  }

  const tree = buildStoryTree(groupedByFile, baseDir);
  const sidebarItems = renderTreeNode(tree);

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

  const escapedProjectName = escapeHtml(projectName);
  const escapedFileExtension = escapeHtml(fileExtension);
  const escapedWorkspaceId = escapeHtml(workspaceId);

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="blockbook-workspace-id" content="${escapedWorkspaceId}">
  <title>SlackBlockbook - ${escapedProjectName}</title>
  <style>
${styles}
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <div class="logo">
      <svg class="logo-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="8" height="8" rx="1.5" fill="#36C5F0"/>
        <rect x="12" y="2" width="8" height="8" rx="1.5" fill="#2EB67D"/>
        <rect x="22" y="2" width="8" height="8" rx="1.5" fill="#E01E5A"/>
        <rect x="2" y="12" width="8" height="8" rx="1.5" fill="#ECB22E"/>
        <rect x="12" y="12" width="8" height="8" rx="1.5" fill="#4A154B"/>
        <rect x="22" y="12" width="8" height="8" rx="1.5" fill="#36C5F0"/>
        <rect x="2" y="22" width="8" height="8" rx="1.5" fill="#2EB67D"/>
        <rect x="12" y="22" width="8" height="8" rx="1.5" fill="#E01E5A"/>
        <rect x="22" y="22" width="8" height="8" rx="1.5" fill="#ECB22E"/>
      </svg>
      <span>SlackBlockbook</span>
    </div>
    <div class="header-divider"></div>
    <div class="project-name">${escapedProjectName}</div>
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
            <div class="empty-title">Select a variant</div>
            <div class="empty-description">
              Select a component from the sidebar to display Block Kit Builder URL
            </div>
          </div>
        </div>
        `
            : `
        <div class="empty-canvas">
          <div class="empty-icon">🔍</div>
          <div class="empty-title">No ${escapedFileExtension} files found</div>
          <div class="empty-description">
            Create a
            <span class="empty-code">${escapedFileExtension}</span> file in the search directory
          </div>
        </div>
        `
        }
      </div>
    </div>
  </div>

  <!-- Bundled story components -->
  <script>
${bundleJs}
  </script>

  <!-- Static client runtime -->
  <script>
${generateStaticClientScript(storyData)}
  </script>
</body>
</html>
`;
}

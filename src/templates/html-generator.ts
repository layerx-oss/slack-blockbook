/**
 * Block Kit Preview HTML generation
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

interface TreeNode {
  name: string;
  children: Map<string, TreeNode>;
  stories: Array<{ storyId: string; storyName: string; filePath: string }>;
}

/**
 * Build a tree structure from story names (using "/" as hierarchy separator)
 * Example: "Components/Buttons/Primary" -> Components > Buttons > Primary
 */
function buildStoryTree(
  groupedByFile: Record<string, GeneratedBlockKitUrl[]>,
  baseDir: string,
): TreeNode {
  const root: TreeNode = { name: "", children: new Map(), stories: [] };

  for (const [filePath, fileUrls] of Object.entries(groupedByFile)) {
    const relativePath = path.relative(baseDir, filePath);
    const fileId = relativePath.replaceAll(/[^a-zA-Z\d]/g, "_");

    for (let index = 0; index < fileUrls.length; index++) {
      const urlData = fileUrls[index]!;
      const storyId = `${fileId}_${index}`;

      // Parse story name for hierarchy (split by "/")
      const nameParts = urlData.storyName.split("/").map((p) => p.trim());
      const storyDisplayName = nameParts[nameParts.length - 1]!;
      const hierarchyParts = nameParts.slice(0, -1);

      // Navigate/create hierarchy
      let current = root;
      for (const part of hierarchyParts) {
        if (!current.children.has(part)) {
          current.children.set(part, {
            name: part,
            children: new Map(),
            stories: [],
          });
        }
        current = current.children.get(part)!;
      }

      // Add story to current node
      current.stories.push({
        storyId,
        storyName: storyDisplayName,
        filePath: relativePath,
      });
    }
  }

  return root;
}

/**
 * Render tree node to HTML
 */
function renderTreeNode(node: TreeNode, depth: number = 0): string {
  let html = "";

  // Render subdirectories (hierarchy from story names)
  const sortedDirs = Array.from(node.children.entries()).sort((a, b) =>
    a[0].localeCompare(b[0]),
  );

  for (const [dirName, childNode] of sortedDirs) {
    const dirId = `dir_${dirName.replaceAll(/[^a-zA-Z\d]/g, "_")}_${depth}`;
    html += `
      <li class="dir-item">
        <div class="dir-header" data-dir-id="${dirId}">
          <span class="dir-chevron">▶</span>
          <span class="folder-icon">📁</span>
          <span class="dir-name">${dirName}</span>
        </div>
        <ul class="dir-children">
          ${renderTreeNode(childNode, depth + 1)}
        </ul>
      </li>
    `;
  }

  // Render stories in this node
  const sortedStories = node.stories.sort((a, b) =>
    a.storyName.localeCompare(b.storyName),
  );

  for (const story of sortedStories) {
    html += `
      <li class="story-item" data-story-id="${story.storyId}">
        <span class="story-icon">📄</span>
        <span class="story-name">${story.storyName}</span>
      </li>
    `;
  }

  return html;
}

/**
 * Generate HTML page
 */
export function generateHtmlPage(
  urls: GeneratedBlockKitUrl[],
  baseDir: string,
  projectName: string,
  fileExtension: string,
): string {
  // Group by file path
  const groupedByFile: Record<string, GeneratedBlockKitUrl[]> = {};
  for (const url of urls) {
    if (!groupedByFile[url.filePath]) {
      groupedByFile[url.filePath] = [];
    }
    groupedByFile[url.filePath]!.push(url);
  }

  // Build story tree from story names and render sidebar
  const tree = buildStoryTree(groupedByFile, baseDir);
  const sidebarItems = renderTreeNode(tree);

  // Convert story detail data to JSON
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
  <title>SlackBlockbook - ${projectName}</title>
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
      <span>SlackBlockbook</span>
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
          <div class="empty-title">No ${fileExtension} files found</div>
          <div class="empty-description">
            Create a
            <span class="empty-code">${fileExtension}</span> file in the search directory
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

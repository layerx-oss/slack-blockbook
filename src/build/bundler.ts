import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { tmpdir } from "node:os";

import { build } from "esbuild";

import { findBlockKitFiles } from "../utils";

export interface BundleResult {
  code: string;
}

function generateEntryPoint(
  storyFiles: string[],
  baseDir: string,
): string {
  const imports = storyFiles.map((filePath, index) =>
    `import { stories as stories_${index} } from ${JSON.stringify(filePath)};`,
  );

  const registrations = storyFiles.map((filePath, index) => {
    const relativePath = path.relative(baseDir, filePath);
    return `  { filePath: ${JSON.stringify(relativePath)}, stories: stories_${index} },`;
  });

  return `${imports.join("\n")}

window.__BLOCKBOOK_STORIES__ = [
${registrations.join("\n")}
];
`;
}

export async function bundleStories(
  searchDir: string,
  fileExtension: string,
  baseDir: string,
): Promise<BundleResult> {
  const storyFiles = findBlockKitFiles(searchDir, fileExtension);

  if (storyFiles.length === 0) {
    return { code: "window.__BLOCKBOOK_STORIES__ = [];" };
  }

  const entryContent = generateEntryPoint(storyFiles, baseDir);

  const tmpDir = path.join(tmpdir(), `slack-blockbook-build-${randomUUID()}`);
  mkdirSync(tmpDir, { recursive: true });
  const entryPath = path.join(tmpDir, "entry.tsx");
  writeFileSync(entryPath, entryContent);

  try {
    const result = await build({
      entryPoints: [entryPath],
      bundle: true,
      format: "iife",
      platform: "browser",
      target: "es2020",
      write: false,
      jsx: "automatic",
      alias: {
        "slack-blockbook": path.join(baseDir, "node_modules", "slack-blockbook"),
        "@layerx/slack-blockbook": path.join(baseDir, "node_modules", "@layerx/slack-blockbook"),
      },
      plugins: [
        {
          name: "slack-blockbook-stub",
          setup(pluginBuild) {
            pluginBuild.onResolve(
              { filter: /^(slack-blockbook|@layerx\/slack-blockbook)$/ },
              () => ({
                path: "slack-blockbook-stub",
                namespace: "stub",
              }),
            );
            pluginBuild.onLoad(
              { filter: /.*/, namespace: "stub" },
              () => ({
                contents: `
                  export function createStory(config) { return config; }
                  export function isBlockKitStory(value) {
                    return typeof value === 'object' && value !== null && typeof value.name === 'string' && typeof value.component === 'function';
                  }
                  export function isBlockKitStoryArray(value) {
                    return Array.isArray(value) && value.every(isBlockKitStory);
                  }
                `,
                loader: "js",
              }),
            );
          },
        },
      ],
    });

    const output = result.outputFiles?.[0];
    if (!output) {
      throw new Error("esbuild produced no output");
    }

    return { code: output.text };
  } finally {
    try {
      rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // cleanup best-effort
    }
  }
}

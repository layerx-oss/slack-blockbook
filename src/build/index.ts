import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { DEFAULT_FILE_EXTENSION } from "../config";
import { collectAllStories } from "../utils";

import { bundleStories } from "./bundler";
import { generateStaticHtmlPage } from "./html-generator";

export interface StaticBuildConfig {
  workspaceId: string;
  searchDir: string;
  fileExtension?: string;
  projectName?: string;
  baseDir?: string;
  outputDir?: string;
}

export async function buildStaticBlockBook(
  config: StaticBuildConfig,
): Promise<void> {
  const fileExtension = config.fileExtension ?? DEFAULT_FILE_EXTENSION;
  const projectName = config.projectName ?? "Block Kit Preview";
  const baseDir = config.baseDir ?? process.cwd();
  const outputDir = config.outputDir ?? "./blockbook-static";

  console.log(`📦 Building static SlackBlockbook...`);
  console.log(`   Search dir: ${config.searchDir}`);
  console.log(`   Output dir: ${outputDir}`);
  console.log("");

  const logger = {
    log: (msg: string) => console.log(msg),
    warn: (msg: string) => console.warn(msg),
    error: (msg: string, ...args: unknown[]) => console.error(msg, ...args),
  };

  console.log("📦 Bundling story components...");
  const bundle = await bundleStories(config.searchDir, fileExtension, baseDir);

  console.log("📄 Collecting stories...");
  const urls = await collectAllStories(
    config.searchDir,
    fileExtension,
    config.workspaceId,
    logger,
  );

  console.log("🔨 Generating static HTML...");
  const html = generateStaticHtmlPage(
    urls,
    baseDir,
    projectName,
    fileExtension,
    config.workspaceId,
    bundle.code,
  );

  const absoluteOutputDir = path.resolve(baseDir, outputDir);
  mkdirSync(absoluteOutputDir, { recursive: true });
  writeFileSync(path.join(absoluteOutputDir, "index.html"), html);

  console.log("");
  console.log(
    `✅ Static build complete! Output: ${path.relative(process.cwd(), absoluteOutputDir)}/`,
  );
  console.log(
    `   ${urls.filter((u) => !u.error).length} stories built successfully`,
  );
  if (urls.some((u) => u.error)) {
    console.log(`   ⚠️ ${urls.filter((u) => u.error).length} stories had errors`);
  }
  console.log("");
  console.log(`💡 To preview: npx serve ${path.relative(process.cwd(), absoluteOutputDir)}`);
}

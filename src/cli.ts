import { existsSync } from "node:fs";
import path from "node:path";

import { createJiti } from "jiti";

function printUsage() {
  console.log(`
Usage: slack-blockbook <script-path> [options]
       slack-blockbook build <script-path> [options]

Commands:
  (default)   Start the development server
  build       Build static HTML output for hosting

Options:
  --help              Show this help message
  --outDir <path>     Output directory for static build (default: ./blockbook-static)

Examples:
  slack-blockbook blockbook.ts
  slack-blockbook build blockbook.ts
  slack-blockbook build blockbook.ts --outDir ./dist
`);
}

function parseOutDir(args: string[]): string | undefined {
  const idx = args.indexOf("--outDir");
  if (idx !== -1 && idx + 1 < args.length) {
    return args[idx + 1];
  }
  return undefined;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help")) {
    printUsage();
    process.exit(args.includes("--help") ? 0 : 1);
  }

  const isBuild = args[0] === "build";
  const scriptPath = isBuild ? args[1] : args[0];

  if (!scriptPath) {
    console.error("❌ Error: Script path is required");
    printUsage();
    process.exit(1);
  }

  const absoluteScriptPath = path.resolve(process.cwd(), scriptPath);

  if (!existsSync(absoluteScriptPath)) {
    console.error(`❌ Error: Script file not found: ${absoluteScriptPath}`);
    process.exit(1);
  }

  if (isBuild) {
    process.env.SLACK_BLOCKBOOK_MODE = "build";
    const outDir = parseOutDir(args);
    if (outDir) {
      process.env.SLACK_BLOCKBOOK_OUT_DIR = outDir;
    }
    console.log(`📦 SlackBlockbook Static Build`);
    console.log(`📝 Script: ${scriptPath}`);
    console.log("");
  } else {
    console.log(`🚀 Starting SlackBlockbook Server...`);
    console.log(`📝 Script: ${scriptPath}`);
    console.log("");
  }

  try {
    const jiti = createJiti(import.meta.url, {
      interopDefault: true,
      moduleCache: false,
      jsx: { runtime: "automatic" },
    });

    await jiti.import(absoluteScriptPath);
  } catch (err) {
    console.error("❌ Failed to execute script:", err);
    process.exit(1);
  }
}

main();

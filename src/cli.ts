import { existsSync } from "node:fs";
import path from "node:path";

import { createJiti } from "jiti";

/**
 * SlackBlockbook CLI
 * Uses jiti to execute TypeScript configuration files without requiring tsx
 */

function printUsage() {
  console.log(`
Usage: slack-blockbook <script-path> [options]

Options:
  --help              Show this help message

Examples:
  slack-blockbook scripts/blockbook-server.ts
  slack-blockbook blockbook.ts
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help")) {
    printUsage();
    process.exit(args.includes("--help") ? 0 : 1);
  }

  const scriptPath = args[0];
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

  console.log(`🚀 Starting SlackBlockbook Server...`);
  console.log(`📝 Script: ${scriptPath}`);
  console.log("");

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

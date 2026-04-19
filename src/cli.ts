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

function resolveScriptPath(scriptPath: string): string {
  const absolutePath = path.resolve(process.cwd(), scriptPath);
  if (!existsSync(absolutePath)) {
    console.error(`❌ Error: Script file not found: ${absolutePath}`);
    process.exit(1);
  }
  return absolutePath;
}

function createJitiInstance() {
  return createJiti(import.meta.url, {
    interopDefault: true,
    moduleCache: false,
    jsx: { runtime: "automatic" },
  });
}

async function runBuild(scriptPath: string, args: string[]) {
  const absoluteScriptPath = resolveScriptPath(scriptPath);
  const outDir = parseOutDir(args);

  console.log(`📦 SlackBlockbook Static Build`);
  console.log(`📝 Script: ${scriptPath}`);
  console.log("");

  const jiti = createJitiInstance();
  const mod = (await jiti.import(absoluteScriptPath)) as Record<string, unknown>;

  const config = mod.config ?? mod.default;
  if (!config || typeof config !== "object") {
    console.error(
      "❌ Error: Script must export a `config` object for build mode.",
    );
    console.error(
      "   Example: export const config = { workspaceId: '...', searchDir: '...' };",
    );
    process.exit(1);
  }

  const { buildStaticBlockBook } = await import("./build/index.js");
  const buildConfig = config as Record<string, unknown>;
  if (outDir) {
    buildConfig.outputDir = outDir;
  }
  await buildStaticBlockBook(buildConfig as unknown as Parameters<typeof buildStaticBlockBook>[0]);
}

async function runDev(scriptPath: string) {
  const absoluteScriptPath = resolveScriptPath(scriptPath);

  console.log(`🚀 Starting SlackBlockbook Server...`);
  console.log(`📝 Script: ${scriptPath}`);
  console.log("");

  const jiti = createJitiInstance();
  await jiti.import(absoluteScriptPath);
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

  try {
    if (isBuild) {
      await runBuild(scriptPath, args);
    } else {
      await runDev(scriptPath);
    }
  } catch (err) {
    console.error("❌ Failed to execute script:", err);
    process.exit(1);
  }
}

main();

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * SlackBlockbook CLI
 * tsx watch を内部で実行するラッパー
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function printUsage() {
  console.log(`
Usage: slack-blockbook <script-path> [options]

Options:
  --tsconfig <path>    Path to tsconfig.json (default: uses package's tsconfig.scripts.json)
  --help              Show this help message

Examples:
  slack-blockbook scripts/blockbook-server.ts
  slack-blockbook scripts/blockbook-server.ts --tsconfig tsconfig.scripts.json
`);
}

function main() {
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

  // Find tsconfig option
  const tsconfigIndex = args.indexOf("--tsconfig");
  let tsconfigPath: string | undefined;

  if (tsconfigIndex !== -1 && args[tsconfigIndex + 1]) {
    // User-specified tsconfig
    tsconfigPath = args[tsconfigIndex + 1];
  } else {
    // Default: use package's tsconfig.scripts.json
    const defaultTsconfig = path.join(__dirname, "../tsconfig.scripts.json");
    if (existsSync(defaultTsconfig)) {
      tsconfigPath = defaultTsconfig;
    }
  }

  // Build tsx watch command
  const tsxArgs = ["watch"];

  if (tsconfigPath) {
    tsxArgs.push("--tsconfig", tsconfigPath);
  }

  tsxArgs.push(scriptPath);

  console.log(`🚀 Starting SlackBlockbook Server...`);
  console.log(`📝 Script: ${scriptPath}`);
  if (tsconfigPath) {
    console.log(`⚙️  TSConfig: ${tsconfigPath}`);
  }
  console.log("");

  // Execute tsx
  const child = spawn("tsx", tsxArgs, {
    stdio: "inherit",
    shell: true,
  });

  child.on("error", (err) => {
    console.error("❌ Failed to start tsx:", err);
    process.exit(1);
  });

  child.on("exit", (code) => {
    if (code !== 0) {
      console.error(`❌ tsx exited with code ${code}`);
      process.exit(code ?? 1);
    }
  });

  // Signal handling
  process.on("SIGINT", () => {
    child.kill("SIGINT");
  });

  process.on("SIGTERM", () => {
    child.kill("SIGTERM");
  });
}

main();

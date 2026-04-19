/**
 * Block Kit Preview Server - modular entry point
 */

import { createServer } from "node:http";
import { URL } from "node:url";

import {
  DEFAULT_FILE_EXTENSION,
  DEFAULT_PORT,
  PROCESS_EXIT_DELAY,
} from "../config";
import type { BlockKitPreviewConfig } from "../types";

import {
  handleEvents,
  handleNotFound,
  handleRender,
  handleRoot,
  type HandlerContext,
} from "./handlers";
import { SseManager } from "./sse-manager";
import { createFileWatcher } from "./watcher";

export { SseManager } from "./sse-manager";
export { createFileWatcher, type FileWatcher, type WatcherOptions } from "./watcher";
export {
  handleEvents,
  handleNotFound,
  handleRender,
  handleRoot,
  type HandlerContext,
} from "./handlers";

/**
 * Start Block Kit Preview Server
 */
export async function startBlockKitPreviewServer(
  config: BlockKitPreviewConfig,
): Promise<void> {
  const port = config.port ?? DEFAULT_PORT;
  const fileExtension = config.fileExtension ?? DEFAULT_FILE_EXTENSION;
  const projectName = config.projectName ?? "Block Kit Preview";
  const baseDir = config.baseDir ?? process.cwd();

  const sseManager = new SseManager();

  const ctx: HandlerContext = {
    config,
    fileExtension,
    baseDir,
    projectName,
    sseManager,
  };

  const watcher = createFileWatcher({
    searchDir: config.searchDir,
    fileExtension,
    baseDir,
    watchPatterns: config.watchPatterns,
    onReload: async () => {
      if (config.restartOnChange) {
        console.log("🔄 Restarting process to clear module cache...");
        sseManager.broadcast("reload");
        await new Promise((resolve) => setTimeout(resolve, PROCESS_EXIT_DELAY));
        await watcher.close();
        server.close(() => {
          console.log("🔄 Exiting process (will restart automatically)");
          process.exit(0);
        });
      } else {
        console.log("📡 Sending reload notification to browser...");
        sseManager.broadcast("reload");
      }
    },
  });

  const server = createServer(async (req, res) => {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);

    if (url.pathname === "/") {
      await handleRoot(req, res, ctx);
    } else if (url.pathname === "/events") {
      handleEvents(req, res, ctx);
    } else if (url.pathname === "/render" && req.method === "POST") {
      await handleRender(req, res, ctx);
    } else {
      handleNotFound(req, res);
    }
  });

  server.listen(port, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║  🚀 SlackBlockbook Server started!                    ║
╚═══════════════════════════════════════════════════════╝

  📍 URL: http://localhost:${port}

  💡 Tips:
     - Open the URL in your browser
     - ${fileExtension} files will auto-reload on change
     - Press Ctrl+C to stop

`);
  });

  process.on("SIGINT", () => {
    console.log("\n\n👋 Shutting down server...");
    sseManager.closeAll();
    watcher.close().then(() => {
      server.close(() => {
        console.log("✅ Server stopped");
        process.exit(0);
      });
    });
  });
}

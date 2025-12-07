import type { ServerResponse } from "node:http";
import { createServer } from "node:http";
import path from "node:path";
import { URL } from "node:url";

import chokidar from "chokidar";

import { generateHtmlPage } from "./templates/html-generator";
import type { BlockKitPreviewConfig } from "./types";
import { collectAllStories, renderStoryWithArgs } from "./utils";

const DEFAULT_PORT = 5176;
const DEFAULT_FILE_EXTENSION = ".blockkit.tsx";

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

  // Manage SSE clients
  const sseClients: ServerResponse[] = [];

  // Notify SSE clients
  function notifyClients(message: string) {
    for (const client of sseClients) {
      client.write(`data: ${message}\n\n`);
    }
  }

  // Debounce reload notification
  let reloadTimeout: NodeJS.Timeout | null = null;
  function scheduleReload(filePath: string) {
    if (reloadTimeout) {
      clearTimeout(reloadTimeout);
    }

    console.log(`🔄 File changed: ${path.relative(baseDir, filePath)}`);

    // Send reload notification or restart process after 300ms
    reloadTimeout = setTimeout(async () => {
      if (config.restartOnChange) {
        // Process restart mode: notify clients then exit
        console.log("🔄 Restarting process to clear module cache...");
        notifyClients("reload");

        // Wait a bit for clients to receive notification
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Exit process (tsx watch will auto-restart)
        await watcher.close();
        server.close(() => {
          console.log("🔄 Exiting process (will restart automatically)");
          process.exit(0);
        });
      } else {
        // Browser reload mode: notify clients only
        console.log("📡 Sending reload notification to browser...");
        notifyClients("reload");
      }
      reloadTimeout = null;
    }, 300);
  }

  // Start file watching
  const watchPatterns: string[] = [
    path.join(config.searchDir, "**", `*${fileExtension}`),
  ];

  // Add additional watch patterns if specified
  if (config.watchPatterns && config.watchPatterns.length > 0) {
    for (const pattern of config.watchPatterns) {
      watchPatterns.push(path.join(config.searchDir, pattern));
    }
  }

  const watcher = chokidar.watch(watchPatterns, {
    ignoreInitial: true,
    persistent: true,
  });

  watcher.on("change", (filePath) => {
    scheduleReload(filePath);
  });

  watcher.on("add", (filePath) => {
    console.log(`➕ File added: ${path.relative(baseDir, filePath)}`);
    scheduleReload(filePath);
  });

  watcher.on("unlink", (filePath) => {
    console.log(`➖ File deleted: ${path.relative(baseDir, filePath)}`);
    scheduleReload(filePath);
  });

  const server = createServer(async (req, res) => {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);

    if (url.pathname === "/") {
      try {
        console.log("🔄 Collecting stories...");
        const urls = await collectAllStories(
          config.searchDir,
          fileExtension,
          config.workspaceId,
          {
            error: console.error,
            log: console.log,
            warn: console.warn,
          },
        );
        console.log(`✅ Found ${urls.length} story(s)`);

        const html = generateHtmlPage(
          urls,
          baseDir,
          projectName,
          fileExtension,
        );

        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(html);
      } catch (err) {
        console.error("❌ Error:", err);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
      }
    } else if (url.pathname === "/events") {
      // SSE endpoint
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });

      // Add client
      sseClients.push(res);

      // Send periodic keepalive to maintain connection
      const keepAliveInterval = setInterval(() => {
        res.write(": keepalive\n\n");
      }, 30_000);

      // Handle client disconnect
      req.on("close", () => {
        clearInterval(keepAliveInterval);
        const index = sseClients.indexOf(res);
        if (index !== -1) {
          sseClients.splice(index, 1);
        }
      });
    } else if (url.pathname === "/render" && req.method === "POST") {
      // API endpoint for re-rendering stories
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", async () => {
        try {
          const data = JSON.parse(body);
          const { filePath, storyName, args } = data;

          console.log("📥 /render request received:");
          console.log("  filePath:", filePath);
          console.log("  storyName:", storyName);
          console.log("  args:", args);

          if (!filePath || !storyName || !args) {
            console.error("❌ Missing required fields");
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Missing required fields" }));
            return;
          }

          const result = await renderStoryWithArgs(
            filePath,
            storyName,
            args,
            config.workspaceId,
            {
              log: console.log,
              warn: console.warn,
              error: console.error,
            },
            baseDir,
          );

          console.log(
            "📤 /render response:",
            result.error ? `Error: ${result.error}` : "Success",
          );

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(result));
        } catch (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              error: err instanceof Error ? err.message : "Unknown error",
            }),
          );
        }
      });
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
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

  // graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n\n👋 Shutting down server...");
    watcher.close().then(() => {
      server.close(() => {
        console.log("✅ Server stopped");
        process.exit(0);
      });
    });
  });
}

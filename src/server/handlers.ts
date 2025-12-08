/**
 * HTTP request handlers for the preview server
 */

import type { IncomingMessage, ServerResponse } from "node:http";

import { generateHtmlPage } from "../templates/html-generator";
import type { BlockKitPreviewConfig, Logger } from "../types";
import { collectAllStories, renderStoryWithArgs } from "../utils";

import type { SseManager } from "./sse-manager";

const consoleLogger: Logger = {
  log: console.log,
  warn: console.warn,
  error: console.error,
};

export interface HandlerContext {
  config: BlockKitPreviewConfig;
  fileExtension: string;
  baseDir: string;
  projectName: string;
  sseManager: SseManager;
  logger?: Logger;
}

/**
 * Handle root request - render HTML page
 */
export async function handleRoot(
  _req: IncomingMessage,
  res: ServerResponse,
  ctx: HandlerContext,
): Promise<void> {
  const logger = ctx.logger ?? consoleLogger;

  try {
    logger.log("🔄 Collecting stories...");
    const urls = await collectAllStories(
      ctx.config.searchDir,
      ctx.fileExtension,
      ctx.config.workspaceId,
      logger,
    );
    logger.log(`✅ Found ${urls.length} story(s)`);

    const html = generateHtmlPage(
      urls,
      ctx.baseDir,
      ctx.projectName,
      ctx.fileExtension,
    );

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
  } catch (err) {
    logger.error("❌ Error:", err);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Internal Server Error");
  }
}

/**
 * Handle SSE events endpoint
 */
export function handleEvents(
  req: IncomingMessage,
  res: ServerResponse,
  ctx: HandlerContext,
): void {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  ctx.sseManager.addClient(res);

  req.on("close", () => {
    ctx.sseManager.removeClient(res);
  });
}

/**
 * Handle render API endpoint
 */
export async function handleRender(
  req: IncomingMessage,
  res: ServerResponse,
  ctx: HandlerContext,
): Promise<void> {
  const logger = ctx.logger ?? consoleLogger;

  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    try {
      const data = JSON.parse(body);
      const { filePath, storyName, args } = data;

      logger.log("📥 /render request received:");
      logger.log(`  filePath: ${filePath}`);
      logger.log(`  storyName: ${storyName}`);
      logger.log(`  args: ${JSON.stringify(args)}`);

      if (!filePath || !storyName || !args) {
        logger.error("❌ Missing required fields");
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Missing required fields" }));
        return;
      }

      const result = await renderStoryWithArgs(
        filePath,
        storyName,
        args,
        ctx.config.workspaceId,
        logger,
        ctx.baseDir,
      );

      logger.log(
        `📤 /render response: ${result.error ? `Error: ${result.error}` : "Success"}`,
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
}

/**
 * Handle 404 not found
 */
export function handleNotFound(
  _req: IncomingMessage,
  res: ServerResponse,
): void {
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
}

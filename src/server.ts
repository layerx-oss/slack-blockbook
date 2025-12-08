/**
 * Block Kit Preview Server
 *
 * This module re-exports from the modular server implementation.
 * For more granular control, import from "./server/index" directly.
 */

export {
  createFileWatcher,
  type FileWatcher,
  handleEvents,
  type HandlerContext,
  handleNotFound,
  handleRender,
  handleRoot,
  SseManager,
  startBlockKitPreviewServer,
  type WatcherOptions,
} from "./server/index";

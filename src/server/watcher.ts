/**
 * File watcher for hot reload
 */

import path from "node:path";

import chokidar from "chokidar";

import { RELOAD_DEBOUNCE_DELAY } from "../config";

export interface WatcherOptions {
  searchDir: string;
  fileExtension: string;
  baseDir: string;
  watchPatterns?: string[];
  onReload: (filePath: string) => void;
  onAdd?: (filePath: string) => void;
  onUnlink?: (filePath: string) => void;
}

export interface FileWatcher {
  close: () => Promise<void>;
}

export function createFileWatcher(options: WatcherOptions): FileWatcher {
  const {
    searchDir,
    fileExtension,
    baseDir,
    watchPatterns: additionalPatterns,
    onReload,
    onAdd,
    onUnlink,
  } = options;

  let reloadTimeout: NodeJS.Timeout | null = null;

  function scheduleReload(filePath: string): void {
    if (reloadTimeout) {
      clearTimeout(reloadTimeout);
    }

    console.log(`🔄 File changed: ${path.relative(baseDir, filePath)}`);

    reloadTimeout = setTimeout(() => {
      onReload(filePath);
      reloadTimeout = null;
    }, RELOAD_DEBOUNCE_DELAY);
  }

  const watchPatterns: string[] = [
    path.join(searchDir, "**", `*${fileExtension}`),
  ];

  if (additionalPatterns && additionalPatterns.length > 0) {
    for (const pattern of additionalPatterns) {
      watchPatterns.push(path.join(searchDir, pattern));
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
    if (onAdd) {
      onAdd(filePath);
    }
    scheduleReload(filePath);
  });

  watcher.on("unlink", (filePath) => {
    console.log(`➖ File deleted: ${path.relative(baseDir, filePath)}`);
    if (onUnlink) {
      onUnlink(filePath);
    }
    scheduleReload(filePath);
  });

  return {
    close: () => watcher.close(),
  };
}

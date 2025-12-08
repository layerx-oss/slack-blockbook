/**
 * Configuration constants and default values
 */

export const DEFAULT_PORT = 5176;
export const DEFAULT_FILE_EXTENSION = ".blockkit.tsx";

export const IGNORED_DIRECTORIES = [
  "node_modules",
  ".git",
  "dist",
  ".next",
  ".nuxt",
] as const;

export const SSE_KEEPALIVE_INTERVAL = 30_000;
export const RELOAD_DEBOUNCE_DELAY = 300;
export const SSE_RECONNECT_DELAY = 1000;
export const INITIAL_SELECTION_DELAY = 100;
export const PROCESS_EXIT_DELAY = 100;

export const UI_CONFIG = {
  sidebar: {
    minWidth: 200,
    maxWidth: 600,
    defaultWidth: 280,
  },
  jsonPreview: {
    maxHeight: "600px",
  },
} as const;

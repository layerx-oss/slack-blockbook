import { describe, expect, it } from "vitest";

import {
  DEFAULT_FILE_EXTENSION,
  DEFAULT_PORT,
  IGNORED_DIRECTORIES,
  INITIAL_SELECTION_DELAY,
  PROCESS_EXIT_DELAY,
  RELOAD_DEBOUNCE_DELAY,
  SSE_KEEPALIVE_INTERVAL,
  SSE_RECONNECT_DELAY,
  UI_CONFIG,
} from "./config";

describe("config constants", () => {
  describe("DEFAULT_PORT", () => {
    it("is a valid port number", () => {
      expect(DEFAULT_PORT).toBe(5176);
      expect(DEFAULT_PORT).toBeGreaterThan(0);
      expect(DEFAULT_PORT).toBeLessThan(65536);
    });
  });

  describe("DEFAULT_FILE_EXTENSION", () => {
    it("has correct extension format", () => {
      expect(DEFAULT_FILE_EXTENSION).toBe(".blockkit.tsx");
      expect(DEFAULT_FILE_EXTENSION).toMatch(/^\..+$/);
    });
  });

  describe("IGNORED_DIRECTORIES", () => {
    it("contains expected directories", () => {
      expect(IGNORED_DIRECTORIES).toContain("node_modules");
      expect(IGNORED_DIRECTORIES).toContain(".git");
      expect(IGNORED_DIRECTORIES).toContain("dist");
    });

    it("is an array of strings", () => {
      expect(Array.isArray(IGNORED_DIRECTORIES)).toBe(true);
      IGNORED_DIRECTORIES.forEach((dir) => {
        expect(typeof dir).toBe("string");
      });
    });
  });

  describe("timing constants", () => {
    it("SSE_KEEPALIVE_INTERVAL is reasonable", () => {
      expect(SSE_KEEPALIVE_INTERVAL).toBe(30_000);
      expect(SSE_KEEPALIVE_INTERVAL).toBeGreaterThan(0);
    });

    it("RELOAD_DEBOUNCE_DELAY is reasonable", () => {
      expect(RELOAD_DEBOUNCE_DELAY).toBe(300);
      expect(RELOAD_DEBOUNCE_DELAY).toBeGreaterThan(0);
    });

    it("SSE_RECONNECT_DELAY is reasonable", () => {
      expect(SSE_RECONNECT_DELAY).toBe(1000);
      expect(SSE_RECONNECT_DELAY).toBeGreaterThan(0);
    });

    it("INITIAL_SELECTION_DELAY is reasonable", () => {
      expect(INITIAL_SELECTION_DELAY).toBe(100);
      expect(INITIAL_SELECTION_DELAY).toBeGreaterThan(0);
    });

    it("PROCESS_EXIT_DELAY is reasonable", () => {
      expect(PROCESS_EXIT_DELAY).toBe(100);
      expect(PROCESS_EXIT_DELAY).toBeGreaterThan(0);
    });
  });

  describe("UI_CONFIG", () => {
    it("has valid sidebar configuration", () => {
      expect(UI_CONFIG.sidebar.minWidth).toBe(200);
      expect(UI_CONFIG.sidebar.maxWidth).toBe(600);
      expect(UI_CONFIG.sidebar.defaultWidth).toBe(280);
      expect(UI_CONFIG.sidebar.minWidth).toBeLessThan(UI_CONFIG.sidebar.maxWidth);
      expect(UI_CONFIG.sidebar.defaultWidth).toBeGreaterThanOrEqual(UI_CONFIG.sidebar.minWidth);
      expect(UI_CONFIG.sidebar.defaultWidth).toBeLessThanOrEqual(UI_CONFIG.sidebar.maxWidth);
    });

    it("has valid jsonPreview configuration", () => {
      expect(UI_CONFIG.jsonPreview.maxHeight).toBe("600px");
    });
  });
});

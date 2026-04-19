import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { buildStaticBlockBook } from "./index";

describe("buildStaticBlockBook", () => {
  let testDir: string;
  let outputDir: string;

  beforeEach(() => {
    testDir = path.join(tmpdir(), `blockbook-build-test-${Date.now()}`);
    outputDir = path.join(testDir, "output");
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it("ストーリーファイルから静的HTMLを生成する", async () => {
    const storyContent = `
export const stories = [
  {
    name: "Build/Test",
    component: (args) => ({
      blocks: [{ type: "section", text: { type: "mrkdwn", text: args?.text || "test" } }]
    }),
    args: { text: "hello" },
    argTypes: { text: { control: "text" } },
  }
];
`;
    writeFileSync(path.join(testDir, "test.blockkit.tsx"), storyContent);

    await buildStaticBlockBook({
      workspaceId: "TEST_WORKSPACE",
      searchDir: testDir,
      baseDir: testDir,
      outputDir,
    });

    const indexPath = path.join(outputDir, "index.html");
    expect(existsSync(indexPath)).toBe(true);

    const html = readFileSync(indexPath, "utf-8");
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("SlackBlockbook");
    expect(html).toContain("Build/Test");
    expect(html).toContain("__BLOCKBOOK_STORIES__");
  });

  it("SSE関連コードを含まない", async () => {
    const storyContent = `
export const stories = [
  { name: "NoSSE/Test", component: () => ({ blocks: [] }) }
];
`;
    writeFileSync(path.join(testDir, "test.blockkit.tsx"), storyContent);

    await buildStaticBlockBook({
      workspaceId: "TEST_WORKSPACE",
      searchDir: testDir,
      baseDir: testDir,
      outputDir,
    });

    const html = readFileSync(path.join(outputDir, "index.html"), "utf-8");
    expect(html).not.toContain("EventSource");
    expect(html).not.toContain("'/events'");
    expect(html).not.toContain("fetch('/render'");
  });

  it("workspaceIdをmetaタグに含む", async () => {
    const storyContent = `
export const stories = [
  { name: "Meta/Test", component: () => ({ blocks: [] }) }
];
`;
    writeFileSync(path.join(testDir, "test.blockkit.tsx"), storyContent);

    await buildStaticBlockBook({
      workspaceId: "MY_WORKSPACE",
      searchDir: testDir,
      baseDir: testDir,
      outputDir,
    });

    const html = readFileSync(path.join(outputDir, "index.html"), "utf-8");
    expect(html).toContain('content="MY_WORKSPACE"');
  });

  it("ストーリーファイルがない場合も正常に動作する", async () => {
    await buildStaticBlockBook({
      workspaceId: "TEST_WORKSPACE",
      searchDir: testDir,
      baseDir: testDir,
      outputDir,
    });

    const indexPath = path.join(outputDir, "index.html");
    expect(existsSync(indexPath)).toBe(true);

    const html = readFileSync(indexPath, "utf-8");
    expect(html).toContain("<!DOCTYPE html>");
  });
});

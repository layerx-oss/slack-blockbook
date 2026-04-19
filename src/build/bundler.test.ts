import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { bundleStories } from "./bundler";

describe("bundleStories", () => {
  let testDir: string;

  beforeEach(() => {
    testDir = path.join(tmpdir(), `blockbook-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it("ストーリーファイルが存在しない場合、空のレジストリを返す", async () => {
    const result = await bundleStories(testDir, ".blockkit.tsx", testDir);
    expect(result.code).toBe("window.__BLOCKBOOK_STORIES__ = [];");
  });

  it("ストーリーファイルをバンドルしてIIFE形式のJSを生成する", async () => {
    const storyContent = `
export const stories = [
  {
    name: "Test/Hello",
    component: (args) => ({
      blocks: [{ type: "section", text: { type: "mrkdwn", text: args?.message || "hello" } }]
    }),
    args: { message: "hello" },
    argTypes: { message: { control: "text" } },
  }
];
`;
    writeFileSync(path.join(testDir, "test.blockkit.tsx"), storyContent);

    const result = await bundleStories(testDir, ".blockkit.tsx", testDir);

    expect(result.code).toBeTruthy();
    expect(result.code).toContain("__BLOCKBOOK_STORIES__");
    expect(result.code).toContain("Test/Hello");
  });

  it("slack-blockbookのインポートをスタブに解決する", async () => {
    const storyContent = `
import { createStory } from "slack-blockbook";

export const stories = [
  createStory({
    name: "Stub/Test",
    component: () => ({ blocks: [] }),
  })
];
`;
    writeFileSync(path.join(testDir, "stub.blockkit.tsx"), storyContent);

    const result = await bundleStories(testDir, ".blockkit.tsx", testDir);

    expect(result.code).toBeTruthy();
    expect(result.code).toContain("__BLOCKBOOK_STORIES__");
    expect(result.code).toContain("Stub/Test");
  });

  it("複数のストーリーファイルをバンドルする", async () => {
    const story1 = `
export const stories = [{ name: "File1/Story", component: () => ({ blocks: [] }) }];
`;
    const story2 = `
export const stories = [{ name: "File2/Story", component: () => ({ blocks: [] }) }];
`;
    writeFileSync(path.join(testDir, "a.blockkit.tsx"), story1);
    writeFileSync(path.join(testDir, "b.blockkit.tsx"), story2);

    const result = await bundleStories(testDir, ".blockkit.tsx", testDir);

    expect(result.code).toContain("File1/Story");
    expect(result.code).toContain("File2/Story");
  });
});

import { describe, expect, it } from "vitest";

import type { BlockKitStory } from "./types";
import {
  createUrlFromStory,
  generateBlockKitUrl,
  isBlockKitJson,
} from "./utils";

describe("generateBlockKitUrl", () => {
  it("wraps blocks array and generates URL", () => {
    const blocks = [{ type: "section", text: { type: "mrkdwn", text: "Hello" } }];
    const url = generateBlockKitUrl("T12345", blocks);

    expect(url).toContain("https://api.slack.com/tools/block-kit-builder#");
    expect(url).toContain(encodeURIComponent(JSON.stringify({ blocks })));
  });

  it("converts object to URL as-is", () => {
    const payload = { type: "modal", title: { type: "plain_text", text: "Modal" } };
    const url = generateBlockKitUrl("T12345", payload);

    expect(url).toContain("https://api.slack.com/tools/block-kit-builder#");
    expect(url).toContain(encodeURIComponent(JSON.stringify(payload)));
  });
});

describe("isBlockKitJson", () => {
  it("returns true for object with type: modal", () => {
    expect(isBlockKitJson({ type: "modal" })).toBe(true);
  });

  it("returns true for object with type: home", () => {
    expect(isBlockKitJson({ type: "home" })).toBe(true);
  });

  it("returns true for object with type: message", () => {
    expect(isBlockKitJson({ type: "message" })).toBe(true);
  });

  it("returns true for object with blocks property", () => {
    expect(isBlockKitJson({ blocks: [] })).toBe(true);
  });

  it("returns true for object with attachments property", () => {
    expect(isBlockKitJson({ attachments: [] })).toBe(true);
  });

  it("returns false for null", () => {
    expect(isBlockKitJson(null)).toBe(false);
  });

  it("returns false for primitive values", () => {
    expect(isBlockKitJson("string")).toBe(false);
    expect(isBlockKitJson(123)).toBe(false);
    expect(isBlockKitJson(true)).toBe(false);
  });

  it("returns false for object with unrelated properties", () => {
    expect(isBlockKitJson({ foo: "bar" })).toBe(false);
  });
});

describe("createUrlFromStory", () => {
  it("generates URL from valid story", () => {
    const story: BlockKitStory = {
      name: "Test Story",
      description: "Test description",
      component: () => ({ blocks: [{ type: "section", text: { type: "mrkdwn", text: "Hello" } }] }),
      tags: ["test"],
    };

    const result = createUrlFromStory(story, "/path/to/file.tsx", "T12345");

    expect(result.storyName).toBe("Test Story");
    expect(result.description).toBe("Test description");
    expect(result.filePath).toBe("/path/to/file.tsx");
    expect(result.url).toContain("https://api.slack.com/tools/block-kit-builder#");
    expect(result.tags).toEqual(["test"]);
    expect(result.error).toBeUndefined();
  });

  it("generates URL from story with args", () => {
    const story: BlockKitStory = {
      name: "Story with args",
      component: (args) => ({
        blocks: [{ type: "section", text: { type: "mrkdwn", text: (args as { text: string })?.text ?? "default" } }],
      }),
      args: { text: "Custom text" },
    };

    const result = createUrlFromStory(story, "/path/to/file.tsx", "T12345");

    expect(result.storyName).toBe("Story with args");
    expect(result.blockKitJson).toEqual({
      blocks: [{ type: "section", text: { type: "mrkdwn", text: "Custom text" } }],
    });
    expect(result.error).toBeUndefined();
  });

  it("allows overriding story args with customArgs", () => {
    const story: BlockKitStory = {
      name: "Custom args test",
      component: (args) => ({
        blocks: [{ type: "section", text: { type: "mrkdwn", text: (args as { text: string })?.text ?? "default" } }],
      }),
      args: { text: "Default" },
    };

    const result = createUrlFromStory(
      story,
      "/path/to/file.tsx",
      "T12345",
      undefined,
      { text: "Overridden text" },
    );

    expect(result.blockKitJson).toEqual({
      blocks: [{ type: "section", text: { type: "mrkdwn", text: "Overridden text" } }],
    });
  });

  it("returns error when component throws", () => {
    const story: BlockKitStory = {
      name: "Error story",
      component: () => {
        throw new Error("Test error");
      },
    };

    const result = createUrlFromStory(story, "/path/to/file.tsx", "T12345");

    expect(result.storyName).toBe("Error story");
    expect(result.url).toBe("");
    expect(result.error).toBe("Test error");
  });

  it("warns but generates URL for non-Block Kit JSON", () => {
    const warnings: string[] = [];
    const story: BlockKitStory = {
      name: "Non Block Kit",
      component: () => ({ foo: "bar" }),
    };

    const result = createUrlFromStory(story, "/path/to/file.tsx", "T12345", {
      warn: (msg) => warnings.push(msg),
      log: () => {},
    });

    expect(result.url).toContain("https://api.slack.com/tools/block-kit-builder#");
    expect(warnings.length).toBe(1);
    expect(warnings[0]).toContain("is not valid Block Kit JSON");
  });
});

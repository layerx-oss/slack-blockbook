import { describe, expect, it } from "vitest";

import type { BlockKitStory } from "./types";
import {
  createUrlFromStory,
  generateBlockKitUrl,
  isBlockKitJson,
} from "./utils";

describe("generateBlockKitUrl", () => {
  it("blocks配列をラップしてURLを生成する", () => {
    const blocks = [{ type: "section", text: { type: "mrkdwn", text: "Hello" } }];
    const url = generateBlockKitUrl("T12345", blocks);

    expect(url).toContain("https://api.slack.com/tools/block-kit-builder#");
    expect(url).toContain(encodeURIComponent(JSON.stringify({ blocks })));
  });

  it("オブジェクトをそのままURLに変換する", () => {
    const payload = { type: "modal", title: { type: "plain_text", text: "Modal" } };
    const url = generateBlockKitUrl("T12345", payload);

    expect(url).toContain("https://api.slack.com/tools/block-kit-builder#");
    expect(url).toContain(encodeURIComponent(JSON.stringify(payload)));
  });
});

describe("isBlockKitJson", () => {
  it("type: modal を持つオブジェクトはBlock Kit JSONと判定する", () => {
    expect(isBlockKitJson({ type: "modal" })).toBe(true);
  });

  it("type: home を持つオブジェクトはBlock Kit JSONと判定する", () => {
    expect(isBlockKitJson({ type: "home" })).toBe(true);
  });

  it("type: message を持つオブジェクトはBlock Kit JSONと判定する", () => {
    expect(isBlockKitJson({ type: "message" })).toBe(true);
  });

  it("blocks プロパティを持つオブジェクトはBlock Kit JSONと判定する", () => {
    expect(isBlockKitJson({ blocks: [] })).toBe(true);
  });

  it("attachments プロパティを持つオブジェクトはBlock Kit JSONと判定する", () => {
    expect(isBlockKitJson({ attachments: [] })).toBe(true);
  });

  it("nullはBlock Kit JSONではない", () => {
    expect(isBlockKitJson(null)).toBe(false);
  });

  it("プリミティブ値はBlock Kit JSONではない", () => {
    expect(isBlockKitJson("string")).toBe(false);
    expect(isBlockKitJson(123)).toBe(false);
    expect(isBlockKitJson(true)).toBe(false);
  });

  it("関係ないプロパティを持つオブジェクトはBlock Kit JSONではない", () => {
    expect(isBlockKitJson({ foo: "bar" })).toBe(false);
  });
});

describe("createUrlFromStory", () => {
  it("正常なストーリーからURLを生成する", () => {
    const story: BlockKitStory = {
      name: "テストストーリー",
      description: "テスト用の説明",
      component: () => ({ blocks: [{ type: "section", text: { type: "mrkdwn", text: "Hello" } }] }),
      tags: ["test"],
    };

    const result = createUrlFromStory(story, "/path/to/file.tsx", "T12345");

    expect(result.storyName).toBe("テストストーリー");
    expect(result.description).toBe("テスト用の説明");
    expect(result.filePath).toBe("/path/to/file.tsx");
    expect(result.url).toContain("https://api.slack.com/tools/block-kit-builder#");
    expect(result.tags).toEqual(["test"]);
    expect(result.error).toBeUndefined();
  });

  it("argsを持つストーリーからURLを生成する", () => {
    const story: BlockKitStory = {
      name: "引数付きストーリー",
      component: (args) => ({
        blocks: [{ type: "section", text: { type: "mrkdwn", text: (args as { text: string })?.text ?? "default" } }],
      }),
      args: { text: "カスタムテキスト" },
    };

    const result = createUrlFromStory(story, "/path/to/file.tsx", "T12345");

    expect(result.storyName).toBe("引数付きストーリー");
    expect(result.blockKitJson).toEqual({
      blocks: [{ type: "section", text: { type: "mrkdwn", text: "カスタムテキスト" } }],
    });
    expect(result.error).toBeUndefined();
  });

  it("customArgsでストーリーを上書きできる", () => {
    const story: BlockKitStory = {
      name: "カスタム引数テスト",
      component: (args) => ({
        blocks: [{ type: "section", text: { type: "mrkdwn", text: (args as { text: string })?.text ?? "default" } }],
      }),
      args: { text: "デフォルト" },
    };

    const result = createUrlFromStory(
      story,
      "/path/to/file.tsx",
      "T12345",
      undefined,
      { text: "上書きされたテキスト" },
    );

    expect(result.blockKitJson).toEqual({
      blocks: [{ type: "section", text: { type: "mrkdwn", text: "上書きされたテキスト" } }],
    });
  });

  it("コンポーネントがエラーを投げた場合はerrorを返す", () => {
    const story: BlockKitStory = {
      name: "エラーストーリー",
      component: () => {
        throw new Error("テストエラー");
      },
    };

    const result = createUrlFromStory(story, "/path/to/file.tsx", "T12345");

    expect(result.storyName).toBe("エラーストーリー");
    expect(result.url).toBe("");
    expect(result.error).toBe("テストエラー");
  });

  it("Block Kit JSON以外の場合は警告を出すがURLは生成する", () => {
    const warnings: string[] = [];
    const story: BlockKitStory = {
      name: "非Block Kit",
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

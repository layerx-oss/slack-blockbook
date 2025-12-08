import { describe, expect, it } from "vitest";

import {
  BlockKitError,
  FileNotFoundError,
  InvalidBlockKitJsonError,
  ParseError,
  StoryNotFoundError,
} from "./errors";

describe("BlockKitError", () => {
  it("has correct name and code", () => {
    const error = new BlockKitError("Test error", "TEST_CODE");
    expect(error.name).toBe("BlockKitError");
    expect(error.code).toBe("TEST_CODE");
    expect(error.message).toBe("Test error");
  });

  it("is instanceof Error", () => {
    const error = new BlockKitError("Test", "CODE");
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(BlockKitError);
  });
});

describe("FileNotFoundError", () => {
  it("has correct message format", () => {
    const error = new FileNotFoundError("/path/to/file.ts");
    expect(error.name).toBe("FileNotFoundError");
    expect(error.code).toBe("FILE_NOT_FOUND");
    expect(error.message).toBe("File not found: /path/to/file.ts");
  });

  it("is instanceof BlockKitError", () => {
    const error = new FileNotFoundError("/path/to/file.ts");
    expect(error).toBeInstanceOf(BlockKitError);
  });
});

describe("ParseError", () => {
  it("has correct message format with file path", () => {
    const error = new ParseError("Unexpected token", "/path/to/file.ts");
    expect(error.name).toBe("ParseError");
    expect(error.code).toBe("PARSE_ERROR");
    expect(error.message).toBe("Parse error in /path/to/file.ts: Unexpected token");
    expect(error.filePath).toBe("/path/to/file.ts");
  });

  it("has correct message format without file path", () => {
    const error = new ParseError("Unexpected token");
    expect(error.message).toBe("Parse error: Unexpected token");
    expect(error.filePath).toBeUndefined();
  });
});

describe("StoryNotFoundError", () => {
  it("has correct message format", () => {
    const error = new StoryNotFoundError("MyStory", "/path/to/file.ts");
    expect(error.name).toBe("StoryNotFoundError");
    expect(error.code).toBe("STORY_NOT_FOUND");
    expect(error.message).toBe('Story "MyStory" not found in /path/to/file.ts');
  });
});

describe("InvalidBlockKitJsonError", () => {
  it("has correct message format", () => {
    const error = new InvalidBlockKitJsonError("MyComponent");
    expect(error.name).toBe("InvalidBlockKitJsonError");
    expect(error.code).toBe("INVALID_BLOCK_KIT_JSON");
    expect(error.message).toBe("MyComponent is not valid Block Kit JSON");
  });
});

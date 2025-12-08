/**
 * Custom error classes for Block Kit operations
 */

export class BlockKitError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "BlockKitError";
  }
}

export class FileNotFoundError extends BlockKitError {
  constructor(filePath: string) {
    super(`File not found: ${filePath}`, "FILE_NOT_FOUND");
    this.name = "FileNotFoundError";
  }
}

export class ParseError extends BlockKitError {
  constructor(message: string, public readonly filePath?: string) {
    super(
      filePath ? `Parse error in ${filePath}: ${message}` : `Parse error: ${message}`,
      "PARSE_ERROR",
    );
    this.name = "ParseError";
  }
}

export class StoryNotFoundError extends BlockKitError {
  constructor(storyName: string, filePath: string) {
    super(`Story "${storyName}" not found in ${filePath}`, "STORY_NOT_FOUND");
    this.name = "StoryNotFoundError";
  }
}

export class InvalidBlockKitJsonError extends BlockKitError {
  constructor(storyName: string) {
    super(`${storyName} is not valid Block Kit JSON`, "INVALID_BLOCK_KIT_JSON");
    this.name = "InvalidBlockKitJsonError";
  }
}

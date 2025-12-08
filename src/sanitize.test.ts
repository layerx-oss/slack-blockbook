import { describe, expect, it } from "vitest";

import { escapeHtml, escapeJsString, sanitizePath } from "./sanitize";

describe("escapeHtml", () => {
  it("escapes ampersand", () => {
    expect(escapeHtml("foo & bar")).toBe("foo &amp; bar");
  });

  it("escapes less than", () => {
    expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
  });

  it("escapes greater than", () => {
    expect(escapeHtml("a > b")).toBe("a &gt; b");
  });

  it("escapes double quotes", () => {
    expect(escapeHtml('say "hello"')).toBe("say &quot;hello&quot;");
  });

  it("escapes single quotes", () => {
    expect(escapeHtml("it's")).toBe("it&#039;s");
  });

  it("handles all special characters together", () => {
    expect(escapeHtml('<a href="test">foo & bar\'s</a>')).toBe(
      "&lt;a href=&quot;test&quot;&gt;foo &amp; bar&#039;s&lt;/a&gt;"
    );
  });

  it("returns empty string for empty input", () => {
    expect(escapeHtml("")).toBe("");
  });

  it("returns unchanged string without special characters", () => {
    expect(escapeHtml("Hello World")).toBe("Hello World");
  });
});

describe("escapeJsString", () => {
  it("escapes backslash", () => {
    expect(escapeJsString("path\\to\\file")).toBe("path\\\\to\\\\file");
  });

  it("escapes single quotes", () => {
    expect(escapeJsString("it's")).toBe("it\\'s");
  });

  it("escapes double quotes", () => {
    expect(escapeJsString('say "hello"')).toBe('say \\"hello\\"');
  });

  it("escapes newline", () => {
    expect(escapeJsString("line1\nline2")).toBe("line1\\nline2");
  });

  it("escapes carriage return", () => {
    expect(escapeJsString("line1\rline2")).toBe("line1\\rline2");
  });

  it("escapes tab", () => {
    expect(escapeJsString("col1\tcol2")).toBe("col1\\tcol2");
  });

  it("escapes less than for script safety", () => {
    expect(escapeJsString("<script>")).toBe("\\u003cscript\\u003e");
  });
});

describe("sanitizePath", () => {
  it("returns valid path within base directory", () => {
    const result = sanitizePath("/home/user/project", "src/file.ts");
    expect(result).toBe("/home/user/project/src/file.ts");
  });

  it("returns null for path traversal attempt", () => {
    const result = sanitizePath("/home/user/project", "../../../etc/passwd");
    expect(result).toBeNull();
  });

  it("handles relative path with ..", () => {
    const result = sanitizePath("/home/user/project", "src/../other/file.ts");
    expect(result).toBe("/home/user/project/other/file.ts");
  });

  it("returns null for null byte injection", () => {
    const result = sanitizePath("/home/user/project", "file.ts\0.txt");
    expect(result).toBeNull();
  });

  it("normalizes path separators", () => {
    const result = sanitizePath("/home/user/project", "src\\file.ts");
    expect(result).toBe("/home/user/project/src/file.ts");
  });

  it("handles absolute input path within base", () => {
    const result = sanitizePath(
      "/home/user/project",
      "/home/user/project/src/file.ts"
    );
    expect(result).toBe("/home/user/project/src/file.ts");
  });

  it("returns null for absolute path outside base", () => {
    const result = sanitizePath("/home/user/project", "/etc/passwd");
    expect(result).toBeNull();
  });
});

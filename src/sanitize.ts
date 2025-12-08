/**
 * Security utilities for HTML and path handling
 */

/**
 * Escape HTML special characters to prevent XSS attacks
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Escape string for use in JavaScript string literals
 */
export function escapeJsString(unsafe: string): string {
  return unsafe
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t")
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e");
}

/**
 * Validate and sanitize file path to prevent directory traversal attacks
 * Returns null if the path is invalid or attempts traversal
 */
export function sanitizePath(
  basePath: string,
  inputPath: string,
): string | null {
  // Normalize paths
  const normalizedBase = basePath.replace(/\\/g, "/");
  const normalizedInput = inputPath.replace(/\\/g, "/");

  // Check for null bytes
  if (normalizedInput.includes("\0")) {
    return null;
  }

  // Resolve the full path
  const fullPath = normalizedInput.startsWith("/")
    ? normalizedInput
    : `${normalizedBase}/${normalizedInput}`;

  // Simple check: ensure the path doesn't escape the base directory
  // by checking for .. patterns
  const parts = fullPath.split("/");
  const resolvedParts: string[] = [];

  for (const part of parts) {
    if (part === "..") {
      if (resolvedParts.length === 0) {
        return null; // Trying to go above root
      }
      resolvedParts.pop();
    } else if (part !== "." && part !== "") {
      resolvedParts.push(part);
    }
  }

  const resolvedPath = "/" + resolvedParts.join("/");

  // Ensure the resolved path is within the base path
  if (!resolvedPath.startsWith(normalizedBase)) {
    return null;
  }

  return resolvedPath;
}

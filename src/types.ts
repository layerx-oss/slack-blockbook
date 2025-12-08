/**
 * Type definitions for Block Kit Builder URL generation
 */

/**
 * Logger interface used across the library
 */
export interface Logger {
  log: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string, ...args: unknown[]) => void;
}

/**
 * Args control types (Storybook-like)
 */
export type ArgType =
  | { control: "text"; description?: string }
  | {
      control: "number";
      description?: string;
      min?: number;
      max?: number;
      step?: number;
    }
  | { control: "boolean"; description?: string }
  | { control: "select"; options: string[]; description?: string }
  | { control: "date"; description?: string }
  | { control: "object"; description?: string };

export interface BlockKitStory<TArgs = Record<string, unknown>> {
  /**
   * Story name
   * @example "Loading", "Error State"
   */
  name: string;

  /**
   * Story description (optional)
   */
  description?: string;

  /**
   * Component that returns Block Kit JSON
   * With args: (args: TArgs) => unknown
   * Without args: () => unknown
   */
  component: (args?: TArgs) => unknown;

  /**
   * Tags to display in Block Kit Builder (optional)
   */
  tags?: string[];

  /**
   * Default arguments (same as Storybook's args)
   */
  args?: TArgs;

  /**
   * Argument type definitions (same as Storybook's argTypes)
   */
  argTypes?: Record<keyof TArgs, ArgType>;
}

/**
 * Generated Block Kit Builder URL information
 */
export interface GeneratedBlockKitUrl {
  /**
   * File path (relative path)
   */
  filePath: string;

  /**
   * Story name
   */
  storyName: string;

  /**
   * Story description
   */
  description?: string;

  /**
   * Generated Block Kit Builder URL
   */
  url: string;

  /**
   * Block Kit JSON (for preview display)
   */
  blockKitJson?: unknown;

  /**
   * Error message (only when error occurs)
   */
  error?: string;

  /**
   * Tags
   */
  tags?: string[];

  /**
   * Default arguments
   */
  args?: Record<string, unknown>;

  /**
   * Argument type definitions
   */
  argTypes?: Record<string, ArgType>;
}

/**
 * Block Kit Preview Server configuration
 */
export interface BlockKitPreviewConfig {
  /**
   * Server port
   * @default 5176
   */
  port?: number;

  /**
   * Slack workspace ID
   * @example "TBQ48385T"
   */
  workspaceId: string;

  /**
   * Directory to search for Block Kit definition files (absolute path)
   * @example "/path/to/project/src/server/slack/jsx"
   */
  searchDir: string;

  /**
   * Block Kit definition file extension
   * @default ".blockkit.tsx"
   */
  fileExtension?: string;

  /**
   * Project name (displayed in header)
   * @example "attendance-webapp"
   */
  projectName?: string;

  /**
   * Base directory for relative paths (absolute path)
   * @default process.cwd()
   */
  baseDir?: string;

  /**
   * Additional file patterns to watch for hot reload
   * Use when files imported by *.blockkit.tsx should also be watched
   * @example ["**\/*.tsx", "**\/*.ts"] - Watch all TS files under searchDir
   * @default undefined - Only watch *.blockkit.tsx files
   */
  watchPatterns?: string[];

  /**
   * Whether to restart process on file change
   * When true, use with watch mode like tsx watch
   * @default false
   */
  restartOnChange?: boolean;
}

/**
 * Block Kit URL generator configuration
 */
export interface BlockKitGeneratorConfig {
  /**
   * Slack workspace ID
   * @example "TBQ48385T"
   */
  workspaceId: string;

  /**
   * Directory to search for Block Kit definition files (absolute path)
   * @example "/path/to/project/src/server/slack/jsx"
   */
  searchDir: string;

  /**
   * Block Kit definition file extension
   * @default ".blockkit.tsx"
   */
  fileExtension?: string;

  /**
   * Output file path (absolute path)
   * @example "/path/to/project/z/block-kit-urls.md"
   */
  outputPath: string;

  /**
   * Base directory for relative paths (absolute path)
   * @default process.cwd()
   */
  baseDir?: string;
}

/**
 * Helper function: Define a story with type inference
 *
 * @example
 * // Story without args
 * createStory({
 *   name: "Loading",
 *   component: () => LoadingModal(),
 * })
 *
 * @example
 * // Story with args
 * createStory<{ type: string }>({
 *   name: "Modal",
 *   args: { type: "info" },
 *   argTypes: {
 *     type: {
 *       control: "select",
 *       options: ["info", "warning", "error"],
 *     },
 *   },
 *   component: (args) => Modal({ type: args?.type ?? "info" }),
 * })
 */
export function createStory<TArgs = Record<string, never>>(
  config: BlockKitStory<TArgs>,
): BlockKitStory<TArgs> {
  return config;
}

/**
 * Type guard to check if value is a BlockKitStory
 */
export function isBlockKitStory(value: unknown): value is BlockKitStory {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;
  return (
    typeof obj.name === "string" &&
    typeof obj.component === "function"
  );
}

/**
 * Type guard to check if value is an array of BlockKitStory
 */
export function isBlockKitStoryArray(value: unknown): value is BlockKitStory[] {
  return Array.isArray(value) && value.every(isBlockKitStory);
}

/**
 * Type guard to check if value is a non-null object
 */
export function isNonNullObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

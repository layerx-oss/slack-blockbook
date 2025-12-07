/**
 * Block Kit Builder URL生成用の型定義
 */

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
   * ストーリーの名前（日本語OK）
   * 例: "承認取得中", "エラー状態"
   */
  name: string;

  /**
   * ストーリーの説明（オプション）
   */
  description?: string;

  /**
   * Block Kit JSONを返すコンポーネント
   * args が指定されている場合は (args: TArgs) => unknown
   * args がない場合は () => unknown
   */
  component: (args?: TArgs) => unknown;

  /**
   * Block Kit Builderで表示するタグ（オプション）
   */
  tags?: string[];

  /**
   * デフォルトの引数（Storybook の args と同じ）
   */
  args?: TArgs;

  /**
   * 引数の型定義（Storybook の argTypes と同じ）
   */
  argTypes?: Record<keyof TArgs, ArgType>;
}

/**
 * 生成されたBlock Kit Builder URL情報
 */
export interface GeneratedBlockKitUrl {
  /**
   * ファイルパス（相対パス）
   */
  filePath: string;

  /**
   * ストーリー名
   */
  storyName: string;

  /**
   * ストーリーの説明
   */
  description?: string;

  /**
   * 生成されたBlock Kit Builder URL
   */
  url: string;

  /**
   * Block Kit JSON（プレビュー表示用）
   */
  blockKitJson?: unknown;

  /**
   * エラーメッセージ（エラー時のみ）
   */
  error?: string;

  /**
   * タグ
   */
  tags?: string[];

  /**
   * デフォルトの引数
   */
  args?: Record<string, unknown>;

  /**
   * 引数の型定義
   */
  argTypes?: Record<string, ArgType>;
}

/**
 * Block Kit Preview Serverの設定
 */
export interface BlockKitPreviewConfig {
  /**
   * サーバーポート
   * @default 5176
   */
  port?: number;

  /**
   * Slack ワークスペースID
   * @example "TBQ48385T"
   */
  workspaceId: string;

  /**
   * Block Kit定義ファイルを検索するディレクトリ（絶対パス）
   * @example "/path/to/project/src/server/slack/jsx"
   */
  searchDir: string;

  /**
   * Block Kit定義ファイルの拡張子
   * @default ".blockkit.tsx"
   */
  fileExtension?: string;

  /**
   * プロジェクト名（ヘッダーに表示）
   * @example "attendance-webapp"
   */
  projectName?: string;

  /**
   * 相対パスの基準ディレクトリ（絶対パス）
   * @default process.cwd()
   */
  baseDir?: string;

  /**
   * ホットリロード時に監視する追加のファイルパターン
   * *.blockkit.tsx がimportしているファイルも監視対象にする場合に使用
   * @example ["**\/*.tsx", "**\/*.ts"] - searchDir配下の全てのTSファイルを監視
   * @default undefined - *.blockkit.tsx のみを監視
   */
  watchPatterns?: string[];

  /**
   * ファイル変更時にプロセスを再起動するかどうか
   * trueの場合、tsx watch などのwatchモードと組み合わせて使用すること
   * @default false
   */
  restartOnChange?: boolean;
}

/**
 * Block Kit URL生成の設定
 */
export interface BlockKitGeneratorConfig {
  /**
   * Slack ワークスペースID
   * @example "TBQ48385T"
   */
  workspaceId: string;

  /**
   * Block Kit定義ファイルを検索するディレクトリ（絶対パス）
   * @example "/path/to/project/src/server/slack/jsx"
   */
  searchDir: string;

  /**
   * Block Kit定義ファイルの拡張子
   * @default ".blockkit.tsx"
   */
  fileExtension?: string;

  /**
   * 出力先ファイルパス（絶対パス）
   * @example "/path/to/project/z/block-kit-urls.md"
   */
  outputPath: string;

  /**
   * 相対パスの基準ディレクトリ（絶対パス）
   * @default process.cwd()
   */
  baseDir?: string;
}

/**
 * ヘルパー関数: 型推論を効かせてストーリーを定義
 *
 * @example
 * // 引数なしのストーリー
 * createStory({
 *   name: "Loading",
 *   component: () => LoadingModal(),
 * })
 *
 * @example
 * // 引数ありのストーリー
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

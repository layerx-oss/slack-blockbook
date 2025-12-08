# slack-blockbook

Storybook-like preview tool for Slack Block Kit development.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
[![npm version](https://badge.fury.io/js/slack-blockbook.svg)](https://badge.fury.io/js/slack-blockbook)

## Features

- **Real-time preview** with hot reload
- **Storybook-style controls** for dynamic arguments
- **Block Kit Builder URL generation**
- **Support for jsx-slack**

## Installation

```bash
npm install -D slack-blockbook
# or
yarn add -D slack-blockbook
# or
pnpm add -D slack-blockbook
```

## Quick Start

### 1. Create a preview server config

```typescript
// scripts/blockbook.ts
import { startBlockKitPreviewServer } from "slack-blockbook";
import path from "path";

startBlockKitPreviewServer({
  port: 5176,
  workspaceId: "YOUR_SLACK_WORKSPACE_ID",
  searchDir: path.join(process.cwd(), "src/slack"),
  projectName: "my-project",
  baseDir: process.cwd(),
  restartOnChange: true,
  watchPatterns: ["**/*.tsx", "**/*.ts"],
});
```

### 2. Create a Block Kit story

```typescript
// src/slack/hello.blockkit.tsx
import { createStory } from "slack-blockbook";
import { Blocks, Section } from "jsx-slack";

export const stories = [
  createStory({
    name: "Hello World",
    component: () => (
      <Blocks>
        <Section>Hello, World!</Section>
      </Blocks>
    ),
  }),
];
```

### 3. Run the preview server

```bash
npx slack-blockbook scripts/blockbook.ts
```

### 4. Open in browser

Open http://localhost:5176 in your browser.

## API

### `startBlockKitPreviewServer(config)`

Starts the preview server with hot reload support.

```typescript
interface BlockKitPreviewConfig {
  port?: number;              // Default: 5176
  workspaceId: string;        // Slack workspace ID
  searchDir: string;          // Directory to search for .blockkit.tsx files
  fileExtension?: string;     // Default: ".blockkit.tsx"
  projectName?: string;       // Displayed in header
  baseDir?: string;           // Base directory for relative paths
  watchPatterns?: string[];   // Additional file patterns to watch
  restartOnChange?: boolean;  // Restart process on file change
}
```

### `createStory(options)`

Creates a story definition with type inference.

```typescript
interface BlockKitStory<TArgs> {
  name: string;                                    // Story name
  description?: string;                            // Story description
  component: (args?: TArgs) => unknown;            // Block Kit JSON component
  tags?: string[];                                 // Tags for filtering
  args?: TArgs;                                    // Default arguments
  argTypes?: Record<keyof TArgs, ArgType>;         // Control types
}
```

### `generateBlockKitUrls(config)`

Generates Block Kit Builder URLs to a Markdown file.

```typescript
interface BlockKitGeneratorConfig {
  workspaceId: string;
  searchDir: string;
  fileExtension?: string;
  outputPath: string;
  baseDir?: string;
}
```

## Controls (argTypes)

Supports Storybook-like controls:

| Control | Description |
|---------|-------------|
| `text` | Text input |
| `number` | Number input with min/max/step |
| `boolean` | Checkbox |
| `select` | Dropdown select |
| `date` | Date picker |

### Example with Controls

```typescript
createStory<{ message: string; count: number; showIcon: boolean }>({
  name: "Configurable Message",
  args: {
    message: "Hello",
    count: 1,
    showIcon: true,
  },
  argTypes: {
    message: { control: "text", description: "Message to display" },
    count: { control: "number", min: 1, max: 10 },
    showIcon: { control: "boolean" },
  },
  component: (args) => (
    <Blocks>
      <Section>
        {args?.showIcon && "👋 "}
        {args?.message} (x{args?.count})
      </Section>
    </Blocks>
  ),
});
```

## CLI

```bash
# Start preview server
slack-blockbook scripts/blockbook.ts
```

## Requirements

- Node.js >= 18

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

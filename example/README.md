# slack-blockbook Example

This directory contains example usage of slack-blockbook with both plain JSON and jsx-slack.

## Setup

```bash
cd example
pnpm install
```

## Run the Preview Server

```bash
pnpm dev
```

Then open http://localhost:5176 in your browser.

## Structure

```
example/
├── blockbook.ts              # Preview server configuration
├── json/                     # Plain JSON examples (no JSX)
│   ├── hello.blockkit.tsx
│   ├── notification.blockkit.tsx
│   └── modal.blockkit.tsx
├── jsx-slack/                # jsx-slack examples
│   ├── hello.blockkit.tsx
│   ├── notification.blockkit.tsx
│   └── modal.blockkit.tsx
├── package.json
├── tsconfig.json
└── README.md
```

## Story Examples

### Plain JSON Example

```typescript
import { createStory } from "slack-blockbook";

export const stories = [
  createStory({
    name: "Hello World",
    component: () => ({
      blocks: [
        {
          type: "section",
          text: { type: "mrkdwn", text: "Hello, World!" },
        },
      ],
    }),
  }),
];
```

### jsx-slack Example

```tsx
/** @jsxImportSource jsx-slack */
import { Blocks, Section } from "jsx-slack";
import { createStory } from "slack-blockbook";

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

### Story with Controls

```typescript
import { createStory } from "slack-blockbook";

interface Args {
  message: string;
  showButton: boolean;
}

export const stories = [
  createStory<Args>({
    name: "Configurable",
    args: {
      message: "Hello",
      showButton: true,
    },
    argTypes: {
      message: { control: "text", description: "Message to display" },
      showButton: { control: "boolean", description: "Show action button" },
    },
    component: (args) => ({
      blocks: [
        {
          type: "section",
          text: { type: "mrkdwn", text: args?.message ?? "" },
        },
      ],
    }),
  }),
];
```

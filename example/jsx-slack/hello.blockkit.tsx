/** @jsxImportSource jsx-slack */
import { Blocks, Section } from "jsx-slack";
import { createStory } from "slack-blockbook";

/**
 * Simple Hello World story using jsx-slack
 */
export const stories = [
  createStory({
    name: "jsx-slack/Hello World",
    description: "A simple Hello World message using jsx-slack",
    tags: ["jsx-slack"],
    component: () => (
      <Blocks>
        <Section>Hello, World! 👋</Section>
      </Blocks>
    ),
  }),
];

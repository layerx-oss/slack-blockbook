import { createStory } from "slack-blockbook";

/**
 * Simple Hello World story using plain JSON
 */
export const stories = [
  createStory({
    name: "json/Hello World",
    description: "A simple Hello World message using plain Block Kit JSON",
    tags: ["json"],
    component: () => ({
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Hello, World! 👋",
          },
        },
      ],
    }),
  }),
];

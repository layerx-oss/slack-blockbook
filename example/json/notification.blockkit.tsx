import { createStory } from "slack-blockbook";

interface NotificationArgs {
  title: string;
  message: string;
  type: string;
  showButton: boolean;
}

const typeEmojis: Record<string, string> = {
  info: "ℹ️",
  success: "✅",
  warning: "⚠️",
  error: "❌",
};

const NotificationBlock = (args: NotificationArgs) => ({
  blocks: [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `${typeEmojis[args.type] || ""} ${args.title}`,
        emoji: true,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: args.message,
      },
    },
    ...(args.showButton
      ? [
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "View Details",
                  emoji: true,
                },
                action_id: "view_details",
              },
            ],
          },
        ]
      : []),
  ],
});

export const stories = [
  createStory<NotificationArgs>({
    name: "json/Notification/Notification Message",
    description: "Display various types of notification messages using plain JSON",
    tags: ["json"],
    args: {
      title: "Notice",
      message: "You have a new message.",
      type: "info",
      showButton: true,
    },
    argTypes: {
      title: { control: "text", description: "Notification title" },
      message: { control: "text", description: "Notification content" },
      type: {
        control: "select",
        options: ["info", "success", "warning", "error"],
        description: "Notification type",
      },
      showButton: { control: "boolean", description: "Whether to show button" },
    },
    component: (args) =>
      NotificationBlock(args ?? { title: "", message: "", type: "info", showButton: false }),
  }),

  createStory({
    name: "json/Notification/Success Notification",
    description: "Notification shown when an operation succeeds",
    tags: ["json", "success"],
    component: () =>
      NotificationBlock({
        title: "Complete",
        message: "Task completed successfully!",
        type: "success",
        showButton: false,
      }),
  }),

  createStory({
    name: "json/Notification/Error Notification",
    description: "Notification shown when an error occurs",
    tags: ["json", "error"],
    component: () =>
      NotificationBlock({
        title: "Error",
        message: "An error occurred during processing. Please try again.",
        type: "error",
        showButton: true,
      }),
  }),
];

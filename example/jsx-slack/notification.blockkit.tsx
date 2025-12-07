/** @jsxImportSource jsx-slack */
import { Actions, Blocks, Button, Header, Section } from "jsx-slack";
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

const NotificationBlock = (args: NotificationArgs) => (
  <Blocks>
    <Header>
      {typeEmojis[args.type] || ""} {args.title}
    </Header>
    <Section>{args.message}</Section>
    {args.showButton && (
      <Actions>
        <Button actionId="view_details">View Details</Button>
      </Actions>
    )}
  </Blocks>
);

export const stories = [
  createStory<NotificationArgs>({
    name: "jsx-slack/Notification/Notification Message",
    description: "Display various types of notification messages using jsx-slack",
    tags: ["jsx-slack"],
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
    name: "jsx-slack/Notification/Success Notification",
    description: "Notification shown when an operation succeeds",
    tags: ["jsx-slack", "success"],
    component: () =>
      NotificationBlock({
        title: "Complete",
        message: "Task completed successfully!",
        type: "success",
        showButton: false,
      }),
  }),

  createStory({
    name: "jsx-slack/Notification/Error Notification",
    description: "Notification shown when an error occurs",
    tags: ["jsx-slack", "error"],
    component: () =>
      NotificationBlock({
        title: "Error",
        message: "An error occurred during processing. Please try again.",
        type: "error",
        showButton: true,
      }),
  }),
];

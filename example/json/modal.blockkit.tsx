import { createStory } from "slack-blockbook";

interface FormModalArgs {
  title: string;
  showDescription: boolean;
  itemCount: number;
}

const FormModal = (args: FormModalArgs) => ({
  type: "modal",
  title: {
    type: "plain_text",
    text: args.title,
    emoji: true,
  },
  submit: {
    type: "plain_text",
    text: "Submit",
    emoji: true,
  },
  close: {
    type: "plain_text",
    text: "Cancel",
    emoji: true,
  },
  blocks: [
    ...(args.showDescription
      ? [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Please fill out the form below.",
            },
          },
          {
            type: "divider",
          },
        ]
      : []),
    {
      type: "input",
      label: {
        type: "plain_text",
        text: "Name",
        emoji: true,
      },
      element: {
        type: "plain_text_input",
        action_id: "name_input",
        placeholder: {
          type: "plain_text",
          text: "Enter your name",
        },
      },
    },
    {
      type: "input",
      label: {
        type: "plain_text",
        text: "Email",
        emoji: true,
      },
      element: {
        type: "email_text_input",
        action_id: "email_input",
        placeholder: {
          type: "plain_text",
          text: "example@company.com",
        },
      },
    },
    ...Array.from({ length: args.itemCount }, (_, i) => ({
      type: "input",
      label: {
        type: "plain_text",
        text: `Additional Field ${i + 1}`,
        emoji: true,
      },
      element: {
        type: "plain_text_input",
        action_id: `additional_input_${i + 1}`,
      },
      optional: true,
    })),
  ],
});

export const stories = [
  createStory<FormModalArgs>({
    name: "json/Modal/Form Modal",
    description: "Modal dialog for user input using plain JSON",
    tags: ["json"],
    args: {
      title: "Contact Us",
      showDescription: true,
      itemCount: 0,
    },
    argTypes: {
      title: { control: "text", description: "Modal title" },
      showDescription: { control: "boolean", description: "Whether to show description" },
      itemCount: {
        control: "number",
        min: 0,
        max: 5,
        step: 1,
        description: "Number of additional input fields",
      },
    },
    component: (args) =>
      FormModal(args ?? { title: "Form", showDescription: true, itemCount: 0 }),
  }),

  createStory({
    name: "json/Modal/Confirmation Modal",
    description: "Simple confirmation dialog for delete actions",
    tags: ["json"],
    component: () => ({
      type: "modal",
      title: {
        type: "plain_text",
        text: "Confirm",
        emoji: true,
      },
      submit: {
        type: "plain_text",
        text: "Delete",
        emoji: true,
      },
      close: {
        type: "plain_text",
        text: "Cancel",
        emoji: true,
      },
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Are you sure you want to delete this item?\n\n*This action cannot be undone.*",
          },
        },
      ],
    }),
  }),
];

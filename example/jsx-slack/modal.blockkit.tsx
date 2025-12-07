/** @jsxImportSource jsx-slack */
import { Divider, Input, Modal, Section } from "jsx-slack";
import { createStory } from "slack-blockbook";

interface FormModalArgs {
  title: string;
  showDescription: boolean;
  itemCount: number;
}

const FormModal = (args: FormModalArgs) => (
  <Modal title={args.title} submit="Submit" close="Cancel">
    {args.showDescription && (
      <>
        <Section>Please fill out the form below.</Section>
        <Divider />
      </>
    )}
    <Input label="Name" id="name_input" placeholder="Enter your name" />
    <Input label="Email" type="email" id="email_input" placeholder="example@company.com" />
    {Array.from({ length: args.itemCount }, (_, i) => (
      <Input
        key={i}
        label={`Additional Field ${i + 1}`}
        id={`additional_input_${i + 1}`}
        optional
      />
    ))}
  </Modal>
);

export const stories = [
  createStory<FormModalArgs>({
    name: "jsx-slack/Modal/Form Modal",
    description: "Modal dialog for user input using jsx-slack",
    tags: ["jsx-slack"],
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
    name: "jsx-slack/Modal/Confirmation Modal",
    description: "Simple confirmation dialog for delete actions",
    tags: ["jsx-slack"],
    component: () => (
      <Modal title="Confirm" submit="Delete" close="Cancel">
        <Section>
          Are you sure you want to delete this item?
          {"\n\n"}
          *This action cannot be undone.*
        </Section>
      </Modal>
    ),
  }),
];

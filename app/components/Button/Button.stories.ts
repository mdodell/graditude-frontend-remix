import type { Meta, StoryObj } from "@storybook/react";

import { StoryButton } from "./Button";

const meta = {
  title: "Components/Button",
  component: StoryButton,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
} satisfies Meta<typeof StoryButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    variant: "filled",
    color: "red",
  },
};

export const Secondary: Story = {
  args: {
    variant: "subtle",
  },
};

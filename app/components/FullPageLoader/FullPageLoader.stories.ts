import type { Meta, StoryObj } from "@storybook/react";

import { FullPageLoader } from "./FullPageLoader";

const meta = {
  title: "Components/FullPageLoader",
  component: FullPageLoader,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
} satisfies Meta<typeof FullPageLoader>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {},
};

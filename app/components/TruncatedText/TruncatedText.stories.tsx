import type { Meta, StoryObj } from "@storybook/react";

import { TruncatedText } from "./TruncatedText";

const meta = {
  title: "Components/TruncatedText",
  component: TruncatedText,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  decorators: [(story) => <div style={{ width: "200px" }}>{story()}</div>],
} satisfies Meta<typeof TruncatedText>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Truncated: Story = {
  args: {
    children: "This is an extra long sentence that I expect to get truncated.",
  },
};

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const NotTruncated: Story = {
  args: {
    children: "Short.",
  },
};

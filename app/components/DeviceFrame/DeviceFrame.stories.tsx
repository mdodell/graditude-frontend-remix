import type { Meta, StoryObj } from "@storybook/react";

import { DeviceFrame } from "./index";
import type { DesktopFrameProps } from "~/components/DeviceFrame/DesktopFrame";
import type { MobileFrameProps } from "~/components/DeviceFrame/MobileFrame";

const meta = {
  title: "Components/DeviceFrame",
  component: DeviceFrame,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  decorators: [
    (story) => <div style={{ height: "100dvh", width: "90vw" }}>{story()}</div>,
  ],
} satisfies Meta<typeof DeviceFrame>;

export default meta;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const DesktopFrame: StoryObj<DesktopFrameProps> = {
  args: {
    variant: "desktop",
    children: <h1>Child component</h1>,
  },
};

export const MobileFrame: StoryObj<MobileFrameProps> = {
  args: {
    variant: "mobile",
    children: <h1>Child component</h1>,
  },
};

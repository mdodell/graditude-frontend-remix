import type { BoxProps } from "@mantine/core";
import type { DesktopFrameProps } from "~/components/DeviceFrame/DesktopFrame";
import { DesktopFrame } from "~/components/DeviceFrame/DesktopFrame";
import type { MobileFrameProps } from "~/components/DeviceFrame/MobileFrame";
import { MobileFrame } from "~/components/DeviceFrame/MobileFrame";

export interface BaseDeviceFrameProps extends BoxProps {
  children?: React.ReactNode;
}

type DeviceFrameProps = DesktopFrameProps | MobileFrameProps;

export function DeviceFrame({ variant, children, ...rest }: DeviceFrameProps) {
  switch (variant) {
    case "mobile":
      return <MobileFrame {...rest}>{children}</MobileFrame>;
    case "desktop":
    default:
      return <DesktopFrame {...rest}>{children}</DesktopFrame>;
  }
}

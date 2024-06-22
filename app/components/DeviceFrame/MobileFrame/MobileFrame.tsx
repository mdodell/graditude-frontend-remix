import { Box } from "@mantine/core";
import type { BaseDeviceFrameProps } from "~/components/DeviceFrame/DeviceFrame";

export interface MobileFrameProps extends BaseDeviceFrameProps {
  variant: "mobile";
}

export function MobileFrame({
  children,
  ...rest
}: Omit<MobileFrameProps, "variant">) {
  return <Box {...rest}>{children}</Box>;
}

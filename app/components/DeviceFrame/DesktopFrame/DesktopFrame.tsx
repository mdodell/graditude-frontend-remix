import type { MantineSize } from "@mantine/core";
import { Box, Flex, Group, useMantineTheme } from "@mantine/core";
import type { BaseDeviceFrameProps } from "~/components/DeviceFrame/DeviceFrame";

export interface DesktopFrameProps extends BaseDeviceFrameProps {
  variant?: "desktop";
  url?: string;
}

const HEADER_HEIGHT = "40px";

const URL_HEIGHT = "24px";

export function DesktopFrame({
  children,
  url,
  ...rest
}: Omit<DesktopFrameProps, "variant">) {
  const theme = useMantineTheme();
  return (
    <Box
      w="100%"
      h="100%"
      {...rest}
      style={{
        borderStyle: "solid",
        borderWidth: "thin",
        borderColor: theme.colors.gray[4],
        borderRadius: theme.radius[theme.defaultRadius as MantineSize],
      }}
    >
      <Flex
        w="100%"
        bg="gray.1"
        h={40}
        style={{
          borderBottomStyle: "solid",
          borderBottomWidth: "thin",
          borderBottomColor: theme.colors.gray[4],
        }}
        align="center"
      >
        <Group pl="lg" gap="sm">
          {[...new Array(3)].map((_, index) => (
            <Box
              key={index}
              h={12}
              w={12}
              bg="gray.4"
              style={{ borderRadius: "50%" }}
            />
          ))}
        </Group>
      </Flex>
      <Flex
        bg="white"
        direction="column"
        h={`calc(100% - ${HEADER_HEIGHT} - ${url ? URL_HEIGHT : "0px"})`}
      >
        <Flex w="100%" justify="center" p="lg">
          {url && (
            <Box
              w="100%"
              bg="gray.7"
              px="xs"
              py="5"
              style={{ borderRadius: "24px" }}
              c="white"
            >
              {url}
            </Box>
          )}
        </Flex>
        {children}
      </Flex>
    </Box>
  );
}

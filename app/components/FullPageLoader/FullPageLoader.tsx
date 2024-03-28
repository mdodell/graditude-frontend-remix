import { Center, Loader, Stack, Text } from "@mantine/core";
import classes from "./FullPageLoader.module.css";

export function FullPageLoader() {
  return (
    <Center classNames={classes}>
      <Stack align="center">
        <Loader />
        <Text ta="center">Loading</Text>
      </Stack>
    </Center>
  );
}

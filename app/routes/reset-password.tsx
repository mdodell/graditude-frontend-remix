import {
  Stack,
  Title,
  Paper,
  Group,
  Center,
  rem,
  Box,
  Text,
} from "@mantine/core";
import { withZod } from "@remix-validated-form/with-zod";
import { IconArrowLeft } from "@tabler/icons-react";
import { redirect } from "@vercel/remix";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@vercel/remix";
import { ValidatedForm, validationError } from "remix-validated-form";
import { z } from "zod";
import { SubmitButton } from "~/components/Form/SubmitButton";
import { Link } from "~/components/Link";
import { getUserToken } from "~/modules/authentication/session.server";
import { http } from "~/utils/api";

import classes from "~/styles/forgot-password.module.css";
import { ValidatedPasswordInput } from "~/components/Form/ValidatedPasswordInput";
import { HTTPError } from "ky";
import { putNotification } from "~/modules/notifications/notifications.server";

function getKey(request: Request) {
  const url = new URL(request.url);

  const key = url.searchParams.get("key");

  return key;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Check if user ID exists - if it does, they should just go through a change password progress since they're already logged in
  const userId = await getUserToken(request);
  if (userId) return redirect("/dashboard");

  // Get the key parameter - if it doesn't exist, log them in
  const key = getKey(request);

  if (!key) {
    throw redirect("/login");
  }

  return null;
};

export const validator = withZod(
  z.object({
    password: z
      .string()
      .min(8, { message: "Password must be 8 characters" })
      .max(72, { message: "Password must be 72 characters" }),
  })
);

export const action = async ({ request }: ActionFunctionArgs) => {
  const body = await request.formData();

  const result = await validator.validate(body);

  if (result.error) {
    return validationError(result.error);
  }

  try {
    const key = getKey(request);
    const { password } = result.data;
    await http.post("reset-password", {
      json: {
        key,
        password,
      },
    });

    const headers = await putNotification({
      type: "success",
      message: "Your password has been successfully reset",
    });

    return redirect("/dashboard", { headers });
  } catch (e) {
    if (e instanceof HTTPError) {
      const message = (await e.response.json()) as { error: string };

      const headers = await putNotification({
        type: "error",
        message: message.error,
      });

      throw redirect(request.url, { headers });
    }
  }
};
export default function ResetPasswordPage() {
  return (
    <Stack w="100%" align="center" justify="center">
      <Title className={classes.title} ta="center">
        Reset your password
      </Title>
      <Text c="dimmed" fz="sm" ta="center">
        Enter your new password
      </Text>

      <Paper
        className={classes.container}
        withBorder
        shadow="md"
        p="xl"
        radius="md"
      >
        <ValidatedForm validator={validator} method="post" noValidate>
          <ValidatedPasswordInput
            name="password"
            label="New password"
            placeholder="Your password"
            required
          />
          <Group justify="space-between" mt="lg" className={classes.controls}>
            <Link c="dimmed" size="sm" className={classes.control} to="/login">
              <Center inline>
                <IconArrowLeft
                  style={{ width: rem(12), height: rem(12) }}
                  stroke={1.5}
                />
                <Box ml={5}>Back to the login page</Box>
              </Center>
            </Link>
            <SubmitButton className={classes.control}>
              Reset password
            </SubmitButton>
          </Group>
        </ValidatedForm>
      </Paper>
    </Stack>
  );
}

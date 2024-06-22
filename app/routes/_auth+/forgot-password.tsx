import {
  Title,
  Paper,
  Group,
  Center,
  rem,
  Box,
  Text,
  Stack,
} from "@mantine/core";
import { withZod } from "@remix-validated-form/with-zod";
import { IconArrowLeft } from "@tabler/icons-react";
import { redirect } from "@vercel/remix";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@vercel/remix";
import { HTTPError } from "ky";
import { ValidatedForm, validationError } from "remix-validated-form";
import { z } from "zod";
import { SubmitButton } from "~/components/Form/SubmitButton";
import { ValidatedTextInput } from "~/components/Form/ValidatedTextInput";
import { Link } from "~/components/Link";
import { getUserToken } from "~/modules/authentication/session.server";
import { putNotification } from "~/modules/notifications/notifications.server";
import classes from "~/styles/forgot-password.module.css";
import { http } from "~/utils/api";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserToken(request);
  if (userId) return redirect("/app");

  return null;
};

export const validator = withZod(
  z.object({
    email: z
      .string()
      .min(1, { message: "Email is required" })
      .email("Must be a valid email"),
  })
);

export const action = async ({ request }: ActionFunctionArgs) => {
  const body = await request.formData();
  const result = await validator.validate(body);

  if (result.error) {
    return validationError(result.error);
  }

  try {
    const { email } = result.data;
    const res = await http
      .post("reset-password-request", {
        json: {
          email,
        },
      })
      .json<{ success: string }>();

    const headers = await putNotification({
      type: "success",
      message: res.success,
    });

    return redirect(request.url, { headers });
  } catch (error) {
    if (error instanceof HTTPError) {
      const message = (await error.response.json()) as { error: string };
      const headers = await putNotification({
        type: "error",
        message: message.error,
      });
      throw redirect(request.url, { headers });
    }
  }
};

export default function ForgotPasswordPage() {
  return (
    <Stack w="100%" align="center" justify="center">
      <Title className={classes.title} ta="center">
        Forgot your password?
      </Title>
      <Text c="dimmed" fz="sm" ta="center">
        Enter your email to get a reset link
      </Text>

      <Paper
        className={classes.container}
        withBorder
        shadow="md"
        p="xl"
        radius="md"
      >
        <ValidatedForm validator={validator} method="post" noValidate>
          <ValidatedTextInput
            name="email"
            label="Your email"
            placeholder="student@graditudeconnects.org"
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

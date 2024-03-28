import {
  Title,
  Text,
  Paper,
  Group,
  Checkbox,
  Flex,
  Stack,
  Container,
} from "@mantine/core";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@vercel/remix";
import { ValidatedForm, validationError } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { z } from "zod";
import { SubmitButton } from "~/components/Form/SubmitButton";
import { ValidatedTextInput } from "~/components/Form/ValidatedTextInput";
import { Link } from "~/components/Link";
import { ValidatedPasswordInput } from "~/components/Form/ValidatedPasswordInput";
import { HTTPError } from "ky";
import type { Tokens } from "~/modules/authentication/types";
import { putNotification } from "~/modules/notifications/notifications.server";

import { redirect, useSearchParams } from "@remix-run/react";
import { http } from "~/utils/api";
import {
  createUserSession,
  getUserToken,
  safeRedirect,
} from "~/modules/authentication/session.server";

export const validator = withZod(
  z.object({
    email: z
      .string()
      .min(1, { message: "Email is required" })
      .email("Must be a valid email"),
    password: z
      .string()
      .min(8, { message: "Password must be 8 characters" })
      .max(72, { message: "Password must be 72 characters" }),
    redirectTo: z.string().optional(),
  })
);

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserToken(request);
  if (userId) throw redirect("/dashboard");

  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const body = await request.formData();

  const redirectTo = safeRedirect(body.get("redirectTo"));

  const result = await validator.validate(body);

  if (result.error) {
    return validationError(result.error);
  }

  try {
    const auth = await http
      .post("login", {
        json: result.data,
      })
      .json<
        {
          success: string;
        } & Tokens
      >();

    return createUserSession({
      token: auth.accessToken,
      refreshToken: auth.refreshToken,
      request,
      redirectTo,
    });
  } catch (error) {
    if (error instanceof HTTPError) {
      const { error: message } = await error.response.json();

      const headers = await putNotification(
        { type: "error", message },
        request.headers
      );

      throw redirect(request.url, { headers });
    }
  }
};

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";
  return (
    <Flex w="100%" align="center" justify="center">
      <Stack style={{ width: 800 }}>
        <Title ta="center" fw="bold">
          Welcome back!
        </Title>
        <Text c="dimmed" size="sm" ta="center" mt={5}>
          Do not have an account yet?{" "}
          <Link size="sm" to="/register">
            Create account
          </Link>
        </Text>

        <Container mx={0}>
          <Paper withBorder shadow="md" p="lg" mt="lg" radius="md">
            <ValidatedForm
              validator={validator}
              defaultValues={{
                redirectTo,
              }}
              method="post"
              noValidate
            >
              <ValidatedTextInput
                required
                label="Email"
                name="email"
                placeholder="student@graditude.org"
              />
              <ValidatedPasswordInput
                required
                label="Password"
                name="password"
                placeholder="Your password"
              />
              <ValidatedTextInput type="hidden" name="redirectTo" />

              <Group justify="space-between" mt="lg">
                <Checkbox label="Remember me" />
                <Link size="sm" to="/forgot-password">
                  Forgot password?
                </Link>
              </Group>
              <SubmitButton
                fullWidth
                mt="xl"
                isSubmittingProps={{
                  loading: true,
                }}
              >
                Sign in
              </SubmitButton>
            </ValidatedForm>
          </Paper>
        </Container>
      </Stack>
    </Flex>
  );
}

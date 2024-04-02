import {
  Flex,
  Stack,
  Title,
  Paper,
  Group,
  Container,
  Text,
  Grid,
} from "@mantine/core";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@vercel/remix";
import { redirect } from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import { ValidatedForm, validationError } from "remix-validated-form";
import { z } from "zod";
import { SubmitButton } from "~/components/Form/SubmitButton";
import { ValidatedPasswordInput } from "~/components/Form/ValidatedPasswordInput";
import { ValidatedTextInput } from "~/components/Form/ValidatedTextInput";
import { Link } from "~/components/Link";
import {
  createUserSession,
  getUserToken,
} from "~/modules/authentication/session.server";
import type { Tokens } from "~/modules/authentication/types";
import { http } from "~/utils/api";
import { HTTPError } from "ky";
import { putNotification } from "~/modules/notifications/notifications.server";

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
    firstName: z
      .string()
      .min(1, { message: "First name must be at least 1 character" }),
    lastName: z
      .string()
      .min(1, { message: "Last name must be at least 1 character" }),
  })
);

export const action = async ({ request }: ActionFunctionArgs) => {
  const body = await request.formData();

  const result = await validator.validate(body);

  if (result.error) {
    return validationError(result.error);
  }

  try {
    const auth = await http
      .post("create-account", {
        json: result.data,
      })
      .json<{ success: string } & Tokens>();

    return createUserSession({
      token: auth.accessToken,
      refreshToken: auth.refreshToken,
      request,
      redirectTo: "/dashboard",
    });
  } catch (e) {
    if (e instanceof HTTPError) {
      const { error } = await e.response.json();

      const headers = await putNotification({
        message: error,
        type: "error",
      });

      throw redirect(request.url, {
        headers,
      });
    }
  }
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserToken(request);
  if (userId) return redirect("/dashboard");

  return null;
};

export default function RegisterPage() {
  return (
    <Flex w="100%" align="center" justify="center">
      <Stack style={{ width: 800 }}>
        <Title ta="center" fw="bold">
          Welcome!
        </Title>
        <Text c="dimmed" size="sm" ta="center">
          Have an account already?{" "}
          <Link size="sm" to="/login">
            Login
          </Link>
        </Text>

        <Container mx={0}>
          <Paper withBorder shadow="md" p="lg" mt="lg" radius="md">
            <ValidatedForm validator={validator} method="post" noValidate>
              <Grid>
                <Grid.Col span={6}>
                  <ValidatedTextInput
                    required
                    label="First Name"
                    name="firstName"
                    placeholder="Fred"
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <ValidatedTextInput
                    required
                    label="Last Name"
                    name="lastName"
                    placeholder="Stevens"
                  />
                </Grid.Col>
              </Grid>

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

              <Group justify="end" mt="xs">
                <Link size="sm" to="/forgot-password">
                  Forgot password?
                </Link>
              </Group>
              <SubmitButton
                fullWidth
                mt="md"
                isSubmittingProps={{
                  loading: true,
                }}
              >
                Sign Up
              </SubmitButton>
            </ValidatedForm>
          </Paper>
        </Container>
      </Stack>
    </Flex>
  );
}

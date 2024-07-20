import {
  Avatar,
  Grid,
  Title,
  Text,
  Group,
  Stack,
  useMantineTheme,
  Button,
  Box,
  TextInput,
  Textarea,
  ColorInput,
} from "@mantine/core";
import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@vercel/remix";
import { z } from "zod";
import { useUser } from "~/hooks/useUser";
import {
  getUserToken,
  requireUserToken,
} from "~/modules/authentication/session.server";
import { putNotification } from "~/modules/notifications/notifications.server";
import { http } from "~/utils/api";
import { HTTPError } from "ky";
import { CollegeCombobox } from "~/routes/resources+/CollegeCombobox";
import { Form, json, useActionData } from "@remix-run/react";
import { getFirstErrorMessage, getFlattenedErrors } from "~/utils/form";
import { DynamicEmailSelect } from "~/components/DynamicEmailSelect";
import { useState } from "react";

const schema = z
  .object({
    name: z
      .string()
      .min(1, { message: "Name is required" })
      .max(72, { message: "Name must be less than 72 characters" }),
    domain: z
      .string()
      .regex(/^[\w-]+$/, {
        message:
          "Domains must use only letters, numbers, hyphens, and underscores.",
      })
      .min(1, { message: "Domain must be 1" })
      .max(30, { message: "Domain must be less than 30 characters" }),
    primaryColor: z.string(),
    description: z
      .string()
      .max(240, {
        message: "Your description can not be more than 240 characters",
      })
      .optional(),
    college: z.string().min(1, { message: "You must select a college. " }),
    emails: z
      .string()
      .transform((emails) => {
        console.log(emails);
        const emailArray = emails.split(",");

        // If the array is just an empty string - meaning there are no emails, just return an empty array
        if (emailArray.length === 1 && emailArray[0] === "") {
          return [];
        }

        return emailArray;
      })
      .pipe(
        z
          .string({
            errorMap: (issue, ctx) => {
              switch (issue.code) {
                case "invalid_string":
                  return {
                    message: `${ctx.data} is an invalid email.`,
                  };
                default:
                  return {
                    message: ctx.defaultError,
                  };
              }
            },
          })
          .email()
          .array()
      ),
  })
  .superRefine(async (data, ctx) => {
    try {
      if (data.domain) {
        await http.get(`organizations/${data.domain}`).json();
        ctx.addIssue({
          path: ["domain"],
          message: "Whoops! That domain is taken.",
          code: "custom",
          fatal: true,
        });
      }
    } catch (e) {}
  });

export const action = async ({ request }: ActionFunctionArgs) => {
  const userToken = await getUserToken(request);

  const formPayload = Object.fromEntries(await request.formData());

  try {
    const result = await schema.parseAsync(formPayload);

    await http
      .post("organizations", {
        json: {
          organization: result,
          emails: result.emails,
        },
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      })
      .json();
    return redirect(`/organization/${result.domain}`);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return json({ fieldErrors: getFlattenedErrors(error).fieldErrors });
    } else if (error instanceof HTTPError) {
      const message = await error.response.json();

      const headers = await putNotification({
        type: "error",
        message: message[0],
      });

      throw redirect(request.url, { headers });
    }
  }
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUserToken(request);

  return null;
};

const FORM_NAME = "onboarding";

export default function OnboardingPage() {
  const user = useUser();
  const errors = useActionData<typeof action>();
  const getError = getFirstErrorMessage<keyof z.infer<typeof schema>>(
    errors?.fieldErrors
  );
  const theme = useMantineTheme();
  const [collegeDomains, setCollegeDomains] = useState<string[] | undefined>(
    undefined
  );

  // const themeColor = useMemo(
  //   () => generateColors(previewState.values.primaryColor),
  //   [previewState.values.primaryColor]
  // );

  return (
    <Grid w="100%" gutter={0} display="flex" overflow="hidden">
      <Grid.Col
        span={{ xs: 12, md: 3 }}
        p="md"
        display="flex"
        style={{ flexDirection: "column" }}
      >
        <Box>
          <Title order={3} my="sm">
            Create Organization
          </Title>
          <Group>
            <Avatar alt={user.profile.firstName} radius="xl" size={40} />
            <Stack justify="flex-start" gap={0}>
              <Text fw={500} c="dimmed" m={0}>
                {user.profile.firstName} {user.profile.lastName}
              </Text>
              <Text size="xs" c="dimmed">
                Owner
              </Text>
            </Stack>
          </Group>
        </Box>
        <Form method="post" noValidate id={FORM_NAME} style={{ flexGrow: 1 }}>
          <Stack h="100%" justify="space-between">
            <Stack gap="xs">
              <TextInput
                required
                name="name"
                label="Organization Name"
                placeholder="Your organization"
                error={getError("name")}
              />
              <TextInput
                required
                label="Domain"
                name="domain"
                placeholder="your-org"
                description="This will be the URL where your organization is on Graditude."
                leftSection="/"
                error={getError("domain")}
              />
              <Textarea
                label="Description"
                name="description"
                placeholder="Tell us what your organization is about."
                error={getError("description")}
              />
              <ColorInput
                label="Branding"
                name="primaryColor"
                defaultValue={theme.colors.blue[5].toUpperCase()}
                description="The core branding for your organization."
                error={getError("primaryColor")}
              />
              <CollegeCombobox
                name="college"
                error={getError("college")}
                onChange={(data) => setCollegeDomains(data.domains)}
              />
              <DynamicEmailSelect
                additionalEmails={collegeDomains}
                name="emails"
                pillsInputProps={{
                  label: "Invite students (optional)",
                }}
                errors={errors?.fieldErrors.emails?.map((e) => e.message)}
                pillsInputFieldProps={{
                  placeholder: "Enter email addresses",
                }}
              />
            </Stack>

            <Button type="submit" fullWidth>
              Create Organization
            </Button>
          </Stack>
        </Form>
      </Grid.Col>
      <Grid.Col span={9} bg="gray.4" visibleFrom="md">
        {/* <DeviceFrame
          p="xl"
          url={`https://www.graditudebeta.org/organization/${
            domain || initialValues.domain
          }`}
        >
          <MantineProvider
            theme={{
              colors: {
                "org-theme": themeColor,
              },
              autoContrast: true,
            }}
          >
            <Box w="100%" h="100%" px="md">
              <Stack gap={0}>
                <TruncatedText size="lg">
                  {previewState.values.name || initialValues.name}
                </TruncatedText>
                <TruncatedText c="dimmed">
                  {previewState.values.description || initialValues.description}
                </TruncatedText>
              </Stack>
              <Divider my="md" />
              <Tabs defaultValue="gallery" variant="outline">
                <Tabs.List>
                  <Tabs.Tab
                    disabled={true}
                    value="gallery"
                    leftSection={<IconPhoto style={iconStyle} />}
                  >
                    Posts
                  </Tabs.Tab>
                  <Tabs.Tab
                    disabled={true}
                    value="messages"
                    leftSection={<IconMessageCircle style={iconStyle} />}
                  >
                    Messages
                  </Tabs.Tab>
                  <Tabs.Tab
                    disabled={true}
                    value="settings"
                    leftSection={<IconSettings style={iconStyle} />}
                  >
                    Settings
                  </Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value="gallery">
                  <Button color="org-theme" mt="xl">
                    Wow, sick branding!
                  </Button>
                </Tabs.Panel>
              </Tabs>
            </Box>
          </MantineProvider>
        </DeviceFrame> */}
      </Grid.Col>
    </Grid>
  );
}

import {
  Avatar,
  Grid,
  Title,
  Text,
  Group,
  Stack,
  useMantineTheme,
  MantineProvider,
  Button,
  Box,
  Divider,
  Tabs,
  rem,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { generateColors } from "@mantine/colors-generator";
import { withZod } from "@remix-validated-form/with-zod";
import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@vercel/remix";
import { HTTPError } from "ky";
import {
  ValidatedForm,
  useControlField,
  useFormContext,
  validationError,
} from "remix-validated-form";
import { z } from "zod";
import { DeviceFrame } from "~/components/DeviceFrame";
import { SubmitButton } from "~/components/Form/SubmitButton";
import { ValidatedColorInput } from "~/components/Form/ValidatedColorInput";
import ValidatedTextArea from "~/components/Form/ValidatedTextArea/ValidatedTextArea";
import { ValidatedTextInput } from "~/components/Form/ValidatedTextInput";
import { useUser } from "~/hooks/useUser";
import {
  getUserToken,
  requireUserToken,
} from "~/modules/authentication/session.server";
import { putNotification } from "~/modules/notifications/notifications.server";
import { http } from "~/utils/api";
import { useMemo } from "react";
import {
  IconPhoto,
  IconMessageCircle,
  IconSettings,
} from "@tabler/icons-react";
import { TruncatedText } from "~/components/TruncatedText";
import { CountryCombobox } from "~/routes/resources+/CountryCombobox";
import { SubdivisionCombobox } from "~/routes/resources+/SubdivisionCombobox";
import { CollegeCombobox } from "~/routes/resources+/CollegeCombobox";

const schema = z.object({
  name: z
    .string()
    .min(1, { message: "Name must be 1 character" })
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
  country: z.string().min(1, { message: "You must select a country" }),
  subdivision: z.string().min(1, { message: "You must select a subdivision" }),
  countryCode: z.string().optional(),
  college: z.string().min(1, { message: "You must select a college. " }),
  domains: z.array(z.string()),
});

const clientValidator = withZod(schema);

export const action = async ({ request }: ActionFunctionArgs) => {
  const serverValidator = withZod(
    schema.refine(
      async (data) => {
        return await http
          .get(`organizations/${data.domain}`)
          .then(() => false)
          .catch(() => true);
      },
      {
        message: "Whoops! That domain is taken.",
        path: ["domain"],
      }
    )
  );

  // Since the db check is already in the schema, we can continue on as normal
  const result = await serverValidator.validate(await request.formData());

  if (result.error) return validationError(result.error);
  const userToken = await getUserToken(request);

  try {
    await http
      .post("organizations", {
        json: {
          organization: result.data,
        },
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      })
      .json();

    return redirect(`/organization/${result.data.domain}`);
  } catch (e) {
    if (e instanceof HTTPError) {
      const message = await e.response.json();

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
  const theme = useMantineTheme();
  const defaultColor = theme.colors.blue[5];

  const initialValues: z.infer<typeof schema> = {
    name: "My Organization",
    description: "Write something here about your first organization.",
    domain: "your-organization",
    primaryColor: defaultColor,
    country: "",
    subdivision: "",
    countryCode: "",
    college: "",
    domains: [],
  };
  const previewState = useForm<z.infer<typeof schema>>({
    mode: "controlled",
    initialValues,
  });

  const [domain, setDomain] = useControlField("domain", FORM_NAME);

  const themeColor = useMemo(
    () => generateColors(previewState.values.primaryColor),
    [previewState.values.primaryColor]
  );

  const iconStyle = { width: rem(12), height: rem(12) };

  return (
    <Grid w="100%" gutter={0} display="flex" overflow="hidden">
      <Grid.Col
        span={3}
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
        <ValidatedForm
          validator={clientValidator}
          method="post"
          noValidate
          id={FORM_NAME}
          defaultValues={{
            primaryColor: defaultColor,
          }}
          style={{ flexGrow: 1 }}
        >
          <Stack h="100%" justify="space-between">
            <Stack gap="xs">
              <ValidatedTextInput
                required
                label="Organization Name"
                name="name"
                placeholder="Your Organization"
              />
              <ValidatedTextInput
                required
                label="Domain"
                name="domain"
                placeholder="your-org"
                description="This will be the URL where your organization is on Graditude."
                leftSection="/"
                onChange={(e) => setDomain(e.currentTarget.value)}
              />
              <ValidatedTextArea
                required
                label="Description"
                name="description"
                placeholder="Tell us what your organization is about."
              />
              <ValidatedColorInput
                required
                label="Branding"
                name="primaryColor"
                description="The core branding for your organization."
                onChange={(color) =>
                  previewState.setFieldValue("primaryColor", color)
                }
              />
              <CountryCombobox
                name="country"
                onChange={(countryData) =>
                  previewState.setFieldValue(
                    "countryCode",
                    countryData.alpha_code
                  )
                }
              />
              {previewState.values.countryCode && (
                <SubdivisionCombobox
                  name="subdivision"
                  country={previewState.values.countryCode}
                />
              )}
              {previewState.values.countryCode && (
                <CollegeCombobox
                  name="college"
                  countryCode={previewState.values.countryCode}
                  onChange={(collegeData) =>
                    previewState.setFieldValue("domains", collegeData.domains)
                  }
                />
              )}
            </Stack>

            <SubmitButton
              fullWidth
              isSubmittingProps={{
                loading: true,
              }}
            >
              Create Organization
            </SubmitButton>
          </Stack>
        </ValidatedForm>
      </Grid.Col>
      <Grid.Col span={9} bg="gray.4">
        <DeviceFrame
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
        </DeviceFrame>
      </Grid.Col>
    </Grid>
  );
}

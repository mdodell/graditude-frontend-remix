// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";

import {
  Await,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  defer,
  useLoaderData,
} from "@remix-run/react";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import {
  closeAccount,
  getUser,
  logout,
} from "~/modules/authentication/session.server";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@vercel/remix";
import { popNotification } from "~/modules/notifications/notifications.server";
import { withZod } from "@remix-validated-form/with-zod";
import { z } from "zod";
import { Notifications, notifications } from "@mantine/notifications";
import { IconX, IconCheck } from "@tabler/icons-react";
import { Suspense, useEffect } from "react";
import { FullPageLoader } from "~/components/FullPageLoader";
import { MainLayout } from "~/components/Layout";
import { ModalsProvider } from "@mantine/modals";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { notification, headers: notificationHeaders } = await popNotification(
    request
  );

  const user = await getUser(request, notificationHeaders);

  return defer(
    {
      user,
      notification,
    },
    { headers: notificationHeaders }
  );
};

export const validator = withZod(
  z.union([
    z.object({
      intent: z.enum(["logout"]),
    }),
    z.object({
      intent: z.enum(["delete-account"]),
    }),
  ])
);

export const action = async ({ request }: ActionFunctionArgs) => {
  const body = await request.formData();

  const result = await validator.validate(body);

  if (result.error) {
    return null;
  }

  const { intent } = result.data;

  switch (intent) {
    case "logout":
      return logout(request);
    case "delete-account":
      return closeAccount(request);
    default:
      return null;
  }
};

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, notification } = useLoaderData<typeof loader>();

  useEffect(() => {
    if (notification) {
      const { id, type, message } = notification;
      notifications.show({
        id: id,
        icon: type === "error" ? <IconX /> : <IconCheck />,
        color: type === "error" ? "red" : "green",
        message: message,
      });
    }
  }, [notification]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <ColorSchemeScript />
      </head>
      <body suppressHydrationWarning={true}>
        <MantineProvider>
          <ModalsProvider>
            <Notifications />
            <Suspense fallback={<FullPageLoader />}>
              <Await resolve={user}>
                <MainLayout>
                  <Outlet />
                </MainLayout>
              </Await>
            </Suspense>
          </ModalsProvider>
        </MantineProvider>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import {
  Await,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  json,
  redirect,
  useLoaderData,
} from "@remix-run/react";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { getUser } from "~/modules/authentication/session.server";
import type { LoaderFunctionArgs } from "@vercel/remix";
import { popNotification } from "~/modules/notifications/notifications.server";
import { Notifications, notifications } from "@mantine/notifications";
import { IconX, IconCheck } from "@tabler/icons-react";
import { Suspense, useEffect } from "react";
import { FullPageLoader } from "~/components/FullPageLoader";
import { ModalsProvider } from "@mantine/modals";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { notification, headers: notificationHeaders } = await popNotification(
    request
  );

  const user = await getUser(request, notificationHeaders);

  // If the user has not onboarded yet, then redirect them to the onboarding flow
  if (
    user &&
    !user.onboardingProgress.hasJoinedOrg &&
    !new URL(request.url).pathname.startsWith("/app/onboarding")
  ) {
    throw redirect("/app/onboarding");
  }

  return json(
    {
      user,
      notification,
    },
    { headers: notificationHeaders }
  );
};

export default function App() {
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
                <Outlet />
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

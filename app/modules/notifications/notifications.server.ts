import { createCookieSessionStorage } from "@vercel/remix";

const NOTIFICATION_COOKIE_NAME = "notification";

const { getSession, commitSession } = createCookieSessionStorage({
  cookie: {
    name: NOTIFICATION_COOKIE_NAME,
  },
});

type Notification = {
  type: "error" | "success";
  message: string;
  id?: string;
};

export async function putNotification(
  notification: Notification,
  headers = new Headers()
) {
  const defaultNotificationProps: Omit<Notification, "message"> = {
    type: "success",
  };

  const session = await getSession();

  session.flash(NOTIFICATION_COOKIE_NAME, {
    ...defaultNotificationProps,
    ...notification,
  });
  headers.append("Set-Cookie", await commitSession(session));

  return headers;
}

export async function popNotification(
  request: Request,
  headers = new Headers()
) {
  const session = await getSession(request.headers.get("Cookie"));

  const notification = session.get(NOTIFICATION_COOKIE_NAME) as Notification;

  headers.set("Set-Cookie", await commitSession(session));

  return { notification, headers };
}

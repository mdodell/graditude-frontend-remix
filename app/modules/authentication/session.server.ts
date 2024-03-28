import { createCookieSessionStorage, redirect } from "@vercel/remix";
import { HTTPError } from "ky";
import type { SuccessfulAuthResponse } from "~/modules/authentication/types";
import { putNotification } from "~/modules/notifications/notifications.server";
import { http } from "~/utils/api";

const ACCESS_TOKEN_KEY = "access";
const REFRESH_TOKEN_KEY = "refresh";

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: ["SOME_SECRET"!],
    secure: process.env.NODE_ENV === "production",
  },
});

async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

export async function refreshTokens(request: Request, headers: Headers) {
  const previousAccessToken = await getUserToken(request);
  const previousRefreshToken = await getRefreshToken(request);

  try {
    const refreshResponse = await http
      .post("jwt-refresh", {
        json: {
          refresh_token: previousRefreshToken,
        },
        headers: {
          Authorization: `Bearer ${previousAccessToken}`,
        },
      })
      .json<SuccessfulAuthResponse>();

    const session = await getSession(request);

    session.set(ACCESS_TOKEN_KEY, refreshResponse.accessToken);
    session.set(REFRESH_TOKEN_KEY, refreshResponse.refreshToken);
    headers.append("Set-Cookie", await sessionStorage.commitSession(session));

    return refreshResponse.account;
  } catch (e) {
    throw await logout(request);
  }
}

export async function getUser(request: Request, headers: Headers) {
  const userToken = await getUserToken(request);
  if (!userToken) return null;

  try {
    const user = await http
      .get("auth/current-account", {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      })
      .json<SuccessfulAuthResponse>();

    if (user) return user.account;
  } catch (e) {
    if (e instanceof HTTPError) {
      return await refreshTokens(request, headers);
    } else {
      throw await logout(request);
    }
  }
}

export async function getRefreshToken(
  request: Request
): Promise<string | undefined> {
  const session = await getSession(request);
  const token = session.get(REFRESH_TOKEN_KEY);

  return token;
}

export async function getUserToken(
  request: Request
): Promise<string | undefined> {
  const session = await getSession(request);
  const token = session.get(ACCESS_TOKEN_KEY);

  return token;
}

const DEFAULT_REDIRECT = "/";

export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT
) {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
}

export async function requireUserToken(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const token = await getUserToken(request);
  if (!token) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return token;
}

export async function createUserSession({
  request,
  token,
  refreshToken,
  redirectTo,
  headers = new Headers(),
}: {
  request: Request;
  token: string;
  refreshToken: string;
  redirectTo: string;
  headers?: Headers;
}) {
  const session = await getSession(request);
  session.set(ACCESS_TOKEN_KEY, token);
  session.set(REFRESH_TOKEN_KEY, refreshToken);
  headers.append("Set-Cookie", await sessionStorage.commitSession(session));
  return redirect(redirectTo, {
    headers,
  });
}

export async function closeAccount(request: Request) {
  const session = await getSession(request);
  const token = await getUserToken(request);

  try {
    await http
      .post("close-account", {
        json: {},
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .json();
  } catch (e) {
    const headers = await putNotification({
      id: "close-account",
      message: "There was a problem with closing your account",
      type: "error",
    });

    const referer = request.headers.get("referer");

    throw redirect(referer!, {
      headers,
    });
  }

  const headers = await putNotification({
    message: "Your account has been successfully deleted",
    type: "success",
  });

  headers.append("Set-Cookie", await sessionStorage.destroySession(session));
  throw redirect("/register", {
    headers,
  });
}

export async function logout(request: Request) {
  const session = await getSession(request);
  return redirect("/login", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}

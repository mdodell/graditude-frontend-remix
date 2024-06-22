import { createCookieSessionStorage, redirect } from "@vercel/remix";

const name = "user";

const userStorage = createCookieSessionStorage({
  cookie: {
    name: name,
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secrets: ["SOME_SECRET"!],
    secure: process.env.NODE_ENV === "production",
  },
});

async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

export const setUser = () => {};

export const destoryUserSession = async (request: Request) => {
  const session = await getSession(request);

  return await sessionStorage.destroySession(session);
};

import { Outlet } from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import type { ActionFunctionArgs } from "react-router";
import { z } from "zod";
import { MainLayout } from "~/components/Layout";
import { logout, closeAccount } from "~/modules/authentication/session.server";

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

export default function AppLayout() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}

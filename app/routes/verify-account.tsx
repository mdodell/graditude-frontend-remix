import type { LoaderFunctionArgs } from "@vercel/remix";
import { redirect } from "@remix-run/react";
import type { Tokens } from "~/modules/authentication/types";
import { putNotification } from "~/modules/notifications/notifications.server";
import { http } from "~/utils/api";
import { FullPageLoader } from "~/components/FullPageLoader";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  const key = url.searchParams.get("key");

  if (!key) {
    throw redirect("/login");
  }

  try {
    await http
      .post("verify-account", {
        json: {
          key,
        },
      })
      .json<{ success: string } & Tokens>();

    const headers = await putNotification({
      id: "verify-account-success",
      message: "Your account has been successfully verified",
      type: "success",
    });

    return redirect("/dashboard", { headers });
  } catch (e) {
    const headers = await putNotification({
      id: "verify-account-failure",
      message: "Failed to verify your account",
      type: "error",
    });

    return redirect("/dashboard", { headers });
  }
};

export default function VerifyAccountPage() {
  return <FullPageLoader />;
}

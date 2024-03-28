import { useRouteLoaderData } from "@remix-run/react";
import type { SuccessfulAuthResponse } from "~/modules/authentication/types";

export function useUser() {
  const { user } = useRouteLoaderData("root") as {
    user: SuccessfulAuthResponse["account"];
  };

  return user;
}

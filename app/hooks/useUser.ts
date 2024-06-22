import { useRouteLoaderData } from "@remix-run/react";
import type { SuccessfulAuthResponse } from "~/modules/authentication/types";

export function useUser() {
  const data = useRouteLoaderData("root") as {
    user: SuccessfulAuthResponse["account"];
  };

  return data?.user;
}

import { redirect } from "@vercel/remix";
import type { LoaderFunctionArgs } from "@vercel/remix";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return redirect("/login");
};

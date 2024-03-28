import { json, type LoaderFunctionArgs } from "@vercel/remix";
import { requireUserToken } from "~/modules/authentication/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUserToken(request);

  return json({});
};

export default function DashboardPage() {
  return <h1>Dashboard</h1>;
}

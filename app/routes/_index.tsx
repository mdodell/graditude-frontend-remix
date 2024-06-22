import { redirect } from "@vercel/remix";

export const loader = () => {
  return redirect("/login");
};

export default function Page() {
  return null;
}

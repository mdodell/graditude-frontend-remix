import { Outlet } from "@remix-run/react";
import { MainLayout } from "~/components/Layout";

export default function AuthLayout() {
  return (
    <MainLayout hideSidebar={true}>
      <Outlet />
    </MainLayout>
  );
}

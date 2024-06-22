import { AppShell } from "@mantine/core";

interface MainProps {
  children: React.ReactNode;
}

export function Main({ children }: MainProps) {
  return <AppShell.Main style={{ display: "flex" }}>{children}</AppShell.Main>;
}

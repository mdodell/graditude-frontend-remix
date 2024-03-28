import { type ReactNode } from "react";
import { AppShell, Burger, Group, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from "./MainLayout.module.css";
import { useUser } from "~/hooks/useUser";
import { UserMenu } from "~/components/Layout/UserMenu";

interface MainLayoutProps {
  children?: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure(false);
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const user = useUser();

  return (
    <AppShell
      header={{ height: 60 }}
      classNames={{ header: classes.header }}
      navbar={{
        width: {
          base: user ? 200 : 0,
          md: !user ? 0 : desktopOpened ? 300 : 80,
        },
        breakpoint: "md",
        collapsed: {
          mobile: !mobileOpened,
          //   desktop: !isLoggedIn,
        },
      }}
    >
      <AppShell.Header>
        <Group h="100%" w="100%" px="md" justify="space-between">
          <>
            <Title size="lg">Graditude</Title>
            <Burger hiddenFrom="sm" size="sm" />
          </>
          {user && <UserMenu />}
        </Group>
      </AppShell.Header>
      {user && <AppShell.Navbar p="md">Navbar</AppShell.Navbar>}
      <AppShell.Main style={{ display: "flex" }}>{children}</AppShell.Main>
    </AppShell>
  );
};

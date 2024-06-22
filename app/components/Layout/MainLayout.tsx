import { useMemo, type ReactNode } from "react";
import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from "./MainLayout.module.css";
import { useUser } from "~/hooks/useUser";
import { useMatches } from "@remix-run/react";
import { HIDE_SIDE_NAV_ON_ROUTES } from "~/constants/routes";
import { Header } from "~/components/Layout/Header";
import { Main } from "~/components/Layout/Main";

interface MainLayoutProps {
  children?: ReactNode;
  hideHeader?: boolean;
  hideSidebar?: boolean;
}

export const MainLayout = ({
  children,
  hideHeader,
  hideSidebar,
}: MainLayoutProps) => {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure(false);
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const user = useUser();
  const matches = useMatches();

  const showSideBar = useMemo(() => {
    const lastMatch = matches[matches.length - 1];

    return (
      lastMatch.id !== "routes/$" &&
      user &&
      !HIDE_SIDE_NAV_ON_ROUTES.includes(lastMatch.pathname)
    );
  }, [matches, user]);

  return (
    <AppShell
      header={{ height: 60 }}
      classNames={{ header: classes.header }}
      navbar={{
        width: {
          base: showSideBar ? 200 : 0,
          // md: !showSideBar ? 0 : desktopOpened ? 300 : 80,
        },
        breakpoint: "md",
        collapsed: {
          mobile: !mobileOpened,
          // desktop: !isLoggedIn,
        },
      }}
    >
      {!hideHeader && <Header />}
      {!hideSidebar && showSideBar && (
        <AppShell.Navbar p="md">Navbar</AppShell.Navbar>
      )}
      <Main>{children}</Main>
    </AppShell>
  );
};

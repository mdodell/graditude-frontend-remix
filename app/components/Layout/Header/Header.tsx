import { AppShell, Group, Title, Burger } from "@mantine/core";
import { UserMenu } from "~/components/Layout/UserMenu";
import { useUser } from "~/hooks/useUser";

export function Header() {
  const user = useUser();
  return (
    <AppShell.Header>
      <Group h="100%" w="100%" px="md" justify="space-between">
        <>
          <Title size="lg">Graditude</Title>
          <Burger hiddenFrom="sm" size="sm" />
        </>
        {user && <UserMenu />}
      </Group>
    </AppShell.Header>
  );
}

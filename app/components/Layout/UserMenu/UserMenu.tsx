import cx from "clsx";
import {
  UnstyledButton,
  Group,
  Avatar,
  rem,
  Text,
  Menu,
  useMantineTheme,
} from "@mantine/core";
import {
  IconChevronDown,
  IconLogout,
  IconSettings,
  IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";
import { useUser } from "~/hooks/useUser";
import classes from "./UserMenu.module.css";
import { Form, useNavigate, useSubmit } from "@remix-run/react";
import { modals } from "@mantine/modals";

export function UserMenu() {
  const user = useUser();
  const theme = useMantineTheme();
  const navigate = useNavigate();
  const submit = useSubmit();
  const [userMenuOpened, setUserMenuOpened] = useState(false);

  const openDeleteModal = () =>
    modals.openConfirmModal({
      title: <Text fw="bold">Delete your profile</Text>,
      centered: true,
      children: (
        <Text>
          Are you sure you want to delete your profile? This action is
          destructive and you will have to contact support to restore your data.
        </Text>
      ),
      labels: { confirm: "Delete account", cancel: "No don't delete it" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        submit({ intent: "delete-account" }, { method: "post" });
      },
    });

  return (
    <Menu
      width={260}
      position="bottom-end"
      transitionProps={{ transition: "pop-top-right" }}
      onClose={() => setUserMenuOpened(false)}
      onOpen={() => setUserMenuOpened(true)}
      withinPortal
    >
      <Menu.Target>
        <UnstyledButton
          className={cx(classes.user, { [classes.userActive]: userMenuOpened })}
        >
          <Group gap={7}>
            <Avatar
              //   src={user.image}
              alt={user.profile.firstName}
              radius="xl"
              size={20}
            />
            <Text fw={500} size="sm" lh={1} mr={3}>
              {user.profile.firstName} {user.profile.lastName}
            </Text>
            <IconChevronDown
              style={{ width: rem(12), height: rem(12) }}
              stroke={1.5}
            />
          </Group>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Settings</Menu.Label>
        <Menu.Item
          leftSection={
            <IconSettings
              style={{ width: rem(16), height: rem(16) }}
              stroke={1.5}
            />
          }
          onClick={() => navigate("/account-settings")}
        >
          Account settings
        </Menu.Item>
        <Form method="POST">
          <Menu.Item
            name="intent"
            value="logout"
            type="submit"
            leftSection={
              <IconLogout
                style={{ width: rem(16), height: rem(16) }}
                stroke={1.5}
              />
            }
          >
            Log out
          </Menu.Item>
        </Form>

        <Menu.Label>Danger zone</Menu.Label>
        <Menu.Item
          color="red"
          leftSection={
            <IconTrash
              style={{ width: rem(16), height: rem(16) }}
              stroke={1.5}
            />
          }
          onClick={openDeleteModal}
        >
          Delete account
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

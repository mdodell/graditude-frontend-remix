import type { AnchorProps } from "@mantine/core";
import { Anchor } from "@mantine/core";
import { Link as RemixLink } from "@remix-run/react";
import type { ComponentPropsWithoutRef } from "react";

type LinkProps = ComponentPropsWithoutRef<typeof RemixLink> &
  Omit<AnchorProps, "component">;

function Link({ children, to, ...anchorProps }: LinkProps) {
  return (
    <Anchor {...anchorProps} component={RemixLink} to={to}>
      {children}
    </Anchor>
  );
}

export default Link;

import {
  Tooltip,
  Text,
  type TextProps,
  type TooltipProps,
} from "@mantine/core";
import { useRef, useState, useEffect } from "react";
import cx from "clsx";

import classes from "./TruncatedText.module.css";

interface TruncatedTextProps extends TextProps {
  tooltipProps?: TooltipProps;
  children?: string;
}
export function TruncatedText({
  children,
  tooltipProps,
  ...rest
}: TruncatedTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [isOverflown, setIsOverflown] = useState(false);
  useEffect(() => {
    const element = ref.current!;
    setIsOverflown(element.scrollWidth > element.clientWidth);
  }, [children]);

  return (
    <Tooltip
      label={children}
      disabled={!isOverflown}
      withArrow
      multiline={true}
      w={220}
      className={classes.tooltip}
    >
      <Text
        truncate="end"
        {...rest}
        ref={ref}
        className={cx({ [classes.truncated]: isOverflown })}
      >
        {children}
      </Text>
    </Tooltip>
  );
}

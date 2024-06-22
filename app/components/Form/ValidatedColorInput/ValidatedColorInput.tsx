import { ColorInput } from "@mantine/core";
import type { ColorInputProps } from "@mantine/core";
import { useField } from "remix-validated-form";

interface ValidatedColorInputProps extends ColorInputProps {
  name: string;
}

export function ValidatedColorInput({
  name,
  onChange,
  ...rest
}: ValidatedColorInputProps) {
  const { error, getInputProps } = useField(name);
  return (
    <ColorInput
      {...rest}
      {...getInputProps({ id: name, onChange })}
      error={error}
    />
  );
}

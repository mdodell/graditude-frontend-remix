import { PasswordInput, type PasswordInputProps } from "@mantine/core";
import { useField } from "remix-validated-form";

interface ValidatedPasswordInputProps extends PasswordInputProps {
  name: string;
}

export function ValidatedPasswordInput({
  name,
  ...rest
}: ValidatedPasswordInputProps) {
  const { error, getInputProps } = useField(name);
  return (
    <PasswordInput {...rest} {...getInputProps({ id: name })} error={error} />
  );
}

export default ValidatedPasswordInput;

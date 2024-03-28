import { TextInput, type TextInputProps } from "@mantine/core";
import { useField } from "remix-validated-form";

interface ValidatedTextInputProps extends TextInputProps {
  name: string;
}

export function ValidatedTextInput({ name, ...rest }: ValidatedTextInputProps) {
  const { error, getInputProps } = useField(name);
  return <TextInput {...rest} {...getInputProps({ id: name })} error={error} />;
}

export default ValidatedTextInput;

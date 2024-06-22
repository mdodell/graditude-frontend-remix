import { Textarea } from "@mantine/core";
import type { TextareaProps } from "@mantine/core";
import { useField } from "remix-validated-form";

interface ValidatedTextAreaProps extends TextareaProps {
  name: string;
}

export function ValidatedTextArea({
  name,
  onChange,
  ...rest
}: ValidatedTextAreaProps) {
  const { error, getInputProps } = useField(name);
  return (
    <Textarea
      {...rest}
      {...getInputProps({ id: name, onChange })}
      error={error}
    />
  );
}

export default ValidatedTextArea;

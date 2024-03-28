import { Button, type ButtonProps } from "@mantine/core";
import { useIsSubmitting } from "remix-validated-form";

interface SubmitButtonProps extends ButtonProps {
  submittingText?: string;
  isSubmittingProps?: ButtonProps;
}

export function SubmitButton({
  children,
  submittingText,
  isSubmittingProps,
  ...buttonProps
}: SubmitButtonProps) {
  const isSubmitting = useIsSubmitting();
  const submittingChildren = submittingText || children;
  return (
    <Button
      type="submit"
      disabled={isSubmitting}
      {...buttonProps}
      {...(isSubmitting && isSubmittingProps)}
    >
      {isSubmitting ? submittingChildren : <>{children}</>}
    </Button>
  );
}

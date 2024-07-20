import type { ZodError, ZodIssue } from "zod";

export const getFlattenedErrors = (errors: ZodError) => {
  const formattedErrors = errors.flatten(
    ({ path, message, code }: ZodIssue) => ({
      path,
      message,
      code,
    })
  );

  return formattedErrors;
};

export const getFirstErrorMessage =
  <T extends string = string>(
    errors?: ReturnType<typeof getFlattenedErrors>["fieldErrors"]
  ) =>
  (field: T) => {
    if (!errors) {
      return undefined;
    }
    return errors[field]?.[0].message;
  };

import { CombinedError } from "urql";

export const onApiError = (
  graphQLError: CombinedError | null | undefined,
  defaultError: string,
  f: (error: string) => void
): boolean => {
  if (!graphQLError) {
    return false;
  }

  const userMessage = graphQLError?.graphQLErrors[0].extensions?.userMessage;

  if (userMessage) {
    f(userMessage as string);
  } else {
    f(defaultError);
  }

  return true;
};

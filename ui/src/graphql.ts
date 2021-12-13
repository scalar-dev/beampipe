import { authExchange } from "@urql/exchange-auth";
import {
  cacheExchange,
  createClient,
  dedupExchange,
  fetchExchange,
  Operation,
} from "urql";

type AuthState = {
  token?: string;
};

const addAuthToOperation = ({
  authState,
  operation,
}: {
  authState: AuthState;
  operation: Operation<any, any>;
}) => {
  // the token isn't in the auth state, return the operation without changes
  if (!authState || !authState.token) {
    return operation;
  }

  // fetchOptions can be a function (See Client API) but you can simplify this based on usage
  const fetchOptions =
    typeof operation.context.fetchOptions === "function"
      ? operation.context.fetchOptions()
      : operation.context.fetchOptions || {};

  return {
    ...operation,
    context: {
      ...operation.context,
      fetchOptions: {
        ...fetchOptions,
        headers: {
          ...fetchOptions.headers,
          Authorization: `Bearer ${authState.token}`,
        },
      },
    },
  };
};

const getAuth = async ({ authState }: { authState: AuthState | null }) => {
  if (authState === null) {
    return { token: localStorage.getItem("jwt")! };
  }

  return null;
};

const graphqlEndpoint = () =>
  window.location.hostname === "app.trawler.dev"
    ? "https://api.beampipe.io/graphql"
    : `http://${window.location.hostname}:8080/graphql`;

export const client = createClient({
  url: "http://localhost:3000/graphql",
  // process.env.NODE_ENV === "development"
  //   ? process.env.REACT_APP_GRAPHQL_ENDPOINT!
  //   : graphqlEndpoint(),
  //
  exchanges: [
    dedupExchange,
    cacheExchange,
    authExchange({
      addAuthToOperation,
      getAuth,
    }),
    fetchExchange,
  ],
});

console.log(client.fetchOptions);
import {
  cacheExchange,
  createClient,
  dedupExchange,
  fetchExchange,
} from "urql";

const graphqlEndpoint = () =>
  window.location.hostname === "app.beampipe.io"
    ? "https://app.beampipe.io/graphql"
    : `http://${window.location.hostname}:${window.location.port}/graphql`;

export const client = createClient({
  url:
    process.env.NODE_ENV === "development"
      ? process.env.REACT_APP_GRAPHQL_ENDPOINT!
      : graphqlEndpoint(),

  exchanges: [dedupExchange, cacheExchange, fetchExchange],
});

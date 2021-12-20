import {
  cacheExchange,
  createClient,
  dedupExchange,
  fetchExchange,
} from "urql";

const graphqlEndpoint = () =>
  window.location.hostname === "app.beampipe.io"
    ? "https://api.beampipe.io/graphql"
    : `http://${window.location.hostname}:3000/graphql`;

export const client = createClient({
  url:
    process.env.NODE_ENV === "development"
      ? process.env.REACT_APP_GRAPHQL_ENDPOINT!
      : graphqlEndpoint(),

  exchanges: [dedupExchange, cacheExchange, fetchExchange],
});

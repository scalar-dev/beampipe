import {
  cacheExchange,
  createClient,
  fetchExchange,
} from "urql";

const graphqlEndpoint = () =>
  `${window.location.origin}/graphql`;

export const client = createClient({
  url: import.meta.env.DEV
    ? import.meta.env.VITE_GRAPHQL_ENDPOINT!
    : graphqlEndpoint(),

  exchanges: [cacheExchange, fetchExchange],
});

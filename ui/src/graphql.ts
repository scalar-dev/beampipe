import {
  cacheExchange,
  createClient,
  dedupExchange,
  fetchExchange,
} from "urql";

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
  exchanges: [dedupExchange, cacheExchange, fetchExchange],
});

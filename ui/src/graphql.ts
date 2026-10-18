import {
  cacheExchange,
  createClient,
  fetchExchange,
} from "urql";

// Same-origin in production; in development Vite proxies /graphql to the API.
export const client = createClient({
  url: `${window.location.origin}/graphql`,

  exchanges: [cacheExchange, fetchExchange],
});

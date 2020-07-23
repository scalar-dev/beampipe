import { withUrqlClient, SSRExchange } from "next-urql";
import { ClientOptions } from "urql";
import { NextPageContext } from "next";

const apiRootUrl = (isServer: boolean) => {
  if (process.env.NODE_ENV === "production") {
    return isServer
      ? `http://${process.env.BACKEND_HOST}:8080/graphql`
      : `${location.origin}/graphql`;
  } else {
    return isServer
      ? "http://localhost:8080/graphql"
      : "http://localhost:3000/graphql";
  }
};

const configureUrql = (
  _: SSRExchange,
  ctx?: NextPageContext
): ClientOptions => {
  const Cookie = ctx?.req?.headers?.cookie;

  return {
    url: apiRootUrl(typeof window === "undefined"),
    fetchOptions: {
      credentials: "include",
      headers: Cookie ? { Cookie } : {},
    },
  };
};

export const withUrql = withUrqlClient(configureUrql);

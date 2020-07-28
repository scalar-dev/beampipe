import { createContext } from "react";
import gql from "graphql-tag";
import { NextUrqlPageContext } from "next-urql";
import { useQuery } from "urql";
import Router from "next/router";

interface User {
  name?: string;
  loggedIn: boolean;
}

const userQuery = gql`
  query user {
    user {
      name
    }
  }
`;

export const UserContext = createContext<User | null>(null);

export const AuthProvider: React.FunctionComponent<{}> = ({ children }) => {
  const [query] = useQuery({ query: userQuery });

  const user = query.data?.user
    ? {
        name: query.data?.user?.name,
        loggedIn: query.data && query.data.user !== null,
      }
    : null;

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export const secured = async (ctx: NextUrqlPageContext) => {
  const client = ctx.urqlClient;
  const user = await client.query(userQuery).toPromise();

  if (!user.data.user) {
    if (ctx && ctx.req) {
      ctx?.res?.writeHead(302, { Location: `/login` });
      ctx?.res?.end();
    } else {
      Router.push(`/login`);
    }
  }

  return {
    user: {
      name: user.data.user.name,
      loggedIn: true,
    },
  };
};

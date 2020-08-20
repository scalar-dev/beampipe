import { createContext } from "react";
import gql from "graphql-tag";
import { NextUrqlPageContext } from "next-urql";
import { useQuery } from "urql";
import Router from "next/router";

export interface User {
  id?: string;
  name?: string;
  email?: string;
}

const userQuery = gql`
  query user {
    user {
      id
      name
      email
    }
  }
`;

const getUser = (data?: any) =>
  data?.user
    ? {
        name: data.user.name,
        email: data.user.email,
        id: data.user.id,
      }
    : null;

export const UserContext = createContext<User | null>(null);

export const AuthProvider: React.FunctionComponent<{}> = ({ children }) => {
  const [query] = useQuery({ query: userQuery });

  return (
    <UserContext.Provider value={getUser(query.data)}>
      {children}
    </UserContext.Provider>
  );
};

export const secured = async (ctx: NextUrqlPageContext) => {
  const client = ctx.urqlClient;
  const userData = await client.query(userQuery).toPromise();
  const user = getUser(userData.data);

  if (!user) {
    if (ctx && ctx.req) {
      ctx?.res?.writeHead(302, { Location: `/sign-in` });
      ctx?.res?.end();
    } else {
      Router.push(`/sign-in`);
    }
  }

  return { user };
};

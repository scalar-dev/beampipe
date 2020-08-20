import { createContext } from "react";
import gql from "graphql-tag";
import { NextUrqlPageContext } from "next-urql";
import { useQuery } from "urql";
import Router from "next/router";

interface UserContext {
  loading: boolean;
  user: User | null;
}

export interface User {
  id: string;
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

const getUser = (data: any, loading: boolean = false) =>
  data?.user
    ? {
        user: {
          name: data.user.name,
          email: data.user.email,
          id: data.user.id,
        },
        loading: false,
      }
    : { user: null, loading };

export const UserContext = createContext<UserContext>({
  user: null,
  loading: true,
});

export const AuthProvider: React.FunctionComponent<{}> = ({ children }) => {
  const [query] = useQuery({ query: userQuery });

  return (
    <UserContext.Provider value={getUser(query.data, query.fetching)}>
      {children}
    </UserContext.Provider>
  );
};

export const secured = async (ctx: NextUrqlPageContext) => {
  const client = ctx.urqlClient;
  const userData = await client.query(userQuery).toPromise();
  const user = getUser(userData.data);

  if (!user.user) {
    if (ctx && ctx.req) {
      ctx?.res?.writeHead(302, { Location: `/sign-in` });
      ctx?.res?.end();
    } else {
      Router.push(`/sign-in`);
    }
  }

  return { user };
};

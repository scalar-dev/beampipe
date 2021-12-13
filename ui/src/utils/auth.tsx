import { createContext } from "react";
import { gql, useQuery } from "urql";

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

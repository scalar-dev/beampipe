import { FunctionComponent, createContext } from "react";
import Head from "next/head";
import Link from "next/link";
import { useQuery } from "urql";
import gql from "graphql-tag";
import { BoldButton } from "./BoldButton";

interface LayoutProps {
  title: string;
}

export const UserContext = createContext(null);

export const Layout: FunctionComponent<LayoutProps> = ({ title, children }) => {
  const [query] = useQuery({
    query: gql`
      query user {
        user {
          name
        }
      }
    `,
  });

  return (
    <div>
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/static/favicon.ico" />
      </Head>

      <div className="w-full min-h-screen bg-gray-100">
        <div className="container m-auto">
          <nav className="flex items-center justify-between flex-wrap py-6">
            <div className="flex items-center flex-shrink-0 text-black mr-6">
              <span className="font-semibold text-3xl tracking-tight">
                <Link href="/">
                  <a>alysis</a>
                </Link>
              </span>
            </div>
            <div className="block lg:hidden">
              <button className="flex items-center px-3 py-2 border rounded text-teal-200 border-teal-400 hover:text-white hover:border-white">
                <svg
                  className="fill-current h-3 w-3"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>Menu</title>
                  <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
                </svg>
              </button>
            </div>
            <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
              <div className="text-sm lg:flex-grow"></div>
              <div>
                {query.data?.user ? (
                  <>
                    <span className="pr-4">{query.data.user.name}</span>
                    <Link href="/logout" passHref>
                      <BoldButton>Logout</BoldButton>
                    </Link>
                  </>
                ) : (
                  <Link href="/login" passHref>
                    <BoldButton>Login</BoldButton>
                  </Link>
                )}
              </div>
            </div>
          </nav>

          <div>
            <UserContext.Provider value={query.data?.user}>
              {children}
            </UserContext.Provider>
          </div>
        </div>
      </div>
    </div>
  );
};

import { FunctionComponent, useContext, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { faAsterisk } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { UserContext } from "../utils/auth";

interface LayoutProps {
  title: string;
}

export const Layout: FunctionComponent<LayoutProps> = ({ title, children }) => {
  const user = useContext(UserContext);
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <>
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/static/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-100">
        <div className="container m-auto">
          <nav className="flex items-center justify-between flex-wrap py-4">
            <div className="flex items-center flex-shrink-0 text-black mr-6">
              <span className="font-extrabold text-green-600 hover:text-green-500 text-3xl tracking-tight align-middle">
                <Link href="/">
                  <a>
                    <FontAwesomeIcon
                      size="sm"
                      className="fill-current w-4 h-4 mr-2"
                      icon={faAsterisk}
                    />
                    beampipe
                  </a>
                </Link>
              </span>
            </div>

            <div className="block lg:hidden">
              <button
                className="flex items-center px-3 py-2 border rounded text-green-600 border-green-600 hover:text-green-500 hover:border-green-500"
                onClick={() => setMenuVisible((visible) => !visible)}
              >
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

            <div
              className={`w-full ${
                menuVisible ? "block" : "hidden"
              } flex-grow bg-white lg:bg-gray-100 border lg:border-none shadow lg:shadow-none lg:flex lg:items-center lg:w-auto`}
            >
              <div className="text-sm lg:flex-grow">
                {user && (
                  <Link href="/app">
                    <a className="block mt-4 ml-4 lg:ml-0 lg:inline-block lg:mt-0 font-extrabold text-green-600 hover:text-green-500 mr-4">
                      Dashboard
                    </a>
                  </Link>
                )}
              </div>

              <div className="text-sm">
                {user ? (
                  <>
                    <Link href="/settings">
                      <a className="block mt-4 ml-4 lg:ml-0 lg:inline-block lg:mt-0 font-extrabold text-green-600 hover:text-green-500 mr-4">
                        Settings
                      </a>
                    </Link>

                    <Link href="/logout">
                      <a className="m-4 lg:m-0 inline-flex items-center justify-center px-5 py-2 border border-transparent text-base leading-6 font-medium rounded-md text-white bg-green-600 hover:bg-green-500 focus:outline-none focus:shadow-outline transition duration-150 ease-in-out">
                        Logout
                      </a>
                    </Link>
                  </>
                ) : (
                  <Link href="/login" passHref>
                    <a className="m-4 lg:m-0 inline-flex items-center justify-center px-5 py-2 border border-transparent text-base leading-6 font-medium rounded-md text-white bg-green-600 hover:bg-green-500 focus:outline-none focus:shadow-outline transition duration-150 ease-in-out">
                      Login
                    </a>
                  </Link>
                )}
              </div>
            </div>
          </nav>
        </div>

        <div>{children}</div>
      </div>
    </>
  );
};

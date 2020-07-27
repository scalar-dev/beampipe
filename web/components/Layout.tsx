import { FunctionComponent, useContext } from "react";
import Head from "next/head";
import Link from "next/link";
import { BoldButton } from "./BoldButton";
import { faFish } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { UserContext } from "../utils/auth";

interface LayoutProps {
  title: string;
}

export const Layout: FunctionComponent<LayoutProps> = ({ title, children }) => {
  const user = useContext(UserContext);
  console.log(user);

  return (
    <>
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/static/favicon.ico" />
      </Head>

      <div className="w-screen min-h-screen bg-gray-100">
        <div className="container m-auto">
          <nav className="flex items-center justify-between flex-wrap py-4">
            <div className="flex items-center flex-shrink-0 text-black mr-6">
              <span className="font-extrabold text-3xl tracking-tight align-middle">
                <Link href="/">
                  <a>
                    <FontAwesomeIcon
                      size="sm"
                      className="fill-current w-4 h-4 mr-2"
                      icon={faFish}
                    />
                    poisson
                  </a>
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
                {user ? (
                  <>
                    <span className="pr-4">{user?.name}</span>
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

          <div>{children}</div>
        </div>
      </div>
    </>
  );
};

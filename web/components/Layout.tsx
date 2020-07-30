import { FunctionComponent, useContext } from "react";
import Head from "next/head";
import Link from "next/link";
import { BoldButton } from "./BoldButton";
import { faAsterisk, faCog } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { UserContext } from "../utils/auth";

interface LayoutProps {
  title: string;
}

export const Layout: FunctionComponent<LayoutProps> = ({ title, children }) => {
  const user = useContext(UserContext);

  return (
    <>
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/static/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-100">
        <div className="container m-auto">
          <nav className="flex items-center justify-between flex-wrap py-4">
            <div className="flex flex-grow text-black mr-6">
              <span className="font-extrabold text-3xl tracking-tight align-middle">
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
         
            <div className="block lg:flex lg:items-center lg:w-auto">
              <div className="text-sm lg:flex-grow"></div>
              <div>
                {user ? (
                  <>
                    <span className="pr-4 text-md text-gray-600">
                      <Link href="/settings">
                        <a>
                          {user?.name}
                          <FontAwesomeIcon className="ml-2" icon={faCog} />
                        </a>
                      </Link>
                    </span>
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
        </div>

        <div>{children}</div>
      </div>
    </>
  );
};

import { FunctionComponent, useContext, useState, forwardRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { faAsterisk } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { UserContext } from "../../utils/auth";
import { AnchorButton } from "../Buttons";
import { Avatar } from "./Avatar";
import {
  faGithub,
  faTwitter,
  faProductHunt,
} from "@fortawesome/free-brands-svg-icons";

interface LayoutProps {
  title: string;
}

interface NavLinkProps
  extends React.DetailedHTMLProps<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  > {}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ children, className, ...otherProps }, ref) => (
    <a
      ref={ref}
      className={`text-sm block mt-4 ml-4 lg:ml-0 lg:inline-block lg:mt-0 font-semibold text-gray-600 hover:text-gray-900 mr-4 ${
        className || ""
      }`}
      {...otherProps}
    >
      {children}
    </a>
  )
);

const SocialButtons = () => (
  <div className="flex flex-row p-4 lg:p-0">
    <a
      className="block flex items-center text-gray-500 hover:text-gray-700 mr-3"
      href="https://twitter.com/beampipe_io"
    >
      <FontAwesomeIcon size="lg" className="fill-current" icon={faTwitter} />
    </a>

    <a
      className="block flex items-center text-gray-500 hover:text-gray-700 mr-3"
      href="https://www.producthunt.com/posts/beampipe"
    >
      <FontAwesomeIcon
        size="lg"
        className="fill-current"
        icon={faProductHunt}
      />
    </a>

    <a
      className="block flex items-center text-gray-500 hover:text-gray-700 mr-3"
      href="https://github.com/beampipe"
    >
      <FontAwesomeIcon size="lg" className="fill-current" icon={faGithub} />
    </a>
  </div>
);

export const IfUserLoggedIn: React.FunctionComponent = ({ children }) => {
  const user = useContext(UserContext);

  if (user.loading) {
    return null;
  }

  return user.user ? <>{children}</> : null;
};

export const IfAnonymous: React.FunctionComponent = ({ children }) => {
  const user = useContext(UserContext);

  if (user.loading) {
    return null;
  }

  return user.user ? null : <>{children}</>;
};

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
              } flex-grow bg-white lg:bg-gray-100 border lg:border-none lg:flex lg:items-center lg:w-auto`}
            >
              <div className="lg:flex-grow flex">
                <div>
                  <IfUserLoggedIn>
                    <Link href="/app" passHref>
                      <NavLink
                        onClick={() => setMenuVisible((visible) => !visible)}
                      >
                        Dashboard
                      </NavLink>
                    </Link>
                  </IfUserLoggedIn>
                </div>

                <div>
                  <NavLink
                    href="https://docs.beampipe.io"
                    target="_new"
                    onClick={() => setMenuVisible((visible) => !visible)}
                  >
                    Docs
                  </NavLink>
                </div>

                <div>
                  <NavLink
                    href="mailto:hello@beampipe.io"
                    onClick={() => setMenuVisible((visible) => !visible)}
                  >
                    Contact us
                  </NavLink>
                </div>
              </div>

              <div className="pr-2">
                <IfUserLoggedIn>
                  <div className="p-4 lg:p-0">
                    <Avatar user={user.user!!} />
                  </div>
                </IfUserLoggedIn>
                <IfAnonymous>
                  <Link href="/sign-in" passHref>
                    <NavLink
                      onClick={() => setMenuVisible((visible) => !visible)}
                    >
                      Login
                    </NavLink>
                  </Link>
                  <div className="block mt-4 ml-4 lg:ml-0 mb-4 lg:inline-block lg:mt-0 lg:mb-0">
                    <Link href="/sign-up" passHref>
                      <AnchorButton
                        className="mr-2"
                        onClick={() => setMenuVisible((visible) => !visible)}
                      >
                        Sign up
                      </AnchorButton>
                    </Link>
                  </div>
                </IfAnonymous>
              </div>
              <SocialButtons />
            </div>
          </nav>
        </div>

        <div>{children}</div>
      </div>
    </>
  );
};

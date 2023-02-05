import { FunctionComponent, useContext, useState } from "react";
import { Link, LinkProps } from "react-router-dom";
import { faAsterisk } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { colorForIntent } from "../Buttons";
import { Avatar } from "./Avatar";
import {
  faGithub,
  faTwitter,
  faMedium,
} from "@fortawesome/free-brands-svg-icons";
import { UserContext } from "../../utils/auth";

interface LayoutProps {
  title: string;
}

const NAV_LINK_CLASS =
  "text-sm block mt-4 ml-4 lg:ml-0 lg:inline-block lg:mt-0 font-semibold text-gray-600 hover:text-gray-900 mr-4";

const NavLink: React.FC<LinkProps> = ({
  children,
  className,
  ...otherProps
}) => (
  <Link
    className={`${NAV_LINK_CLASS}
      ${className || ""}
    `}
    {...otherProps}
  >
    {children}
  </Link>
);

const SocialButtons = () => (
  <div className="flex flex-row p-4 lg:p-0">
    <a
      className="flex items-center text-gray-500 hover:text-gray-700 mr-3"
      href="https://twitter.com/beampipe_io"
    >
      <FontAwesomeIcon size="lg" className="fill-current" icon={faTwitter} />
    </a>

    <a
      className="flex items-center text-gray-500 hover:text-gray-700 mr-3"
      href="https://medium.com/beampipe"
    >
      <FontAwesomeIcon size="lg" className="fill-current" icon={faMedium} />
    </a>

    {/* <a
      className="flex items-center text-gray-500 hover:text-gray-700 mr-3"
      href="https://www.producthunt.com/posts/beampipe"
    >
      <FontAwesomeIcon
        size="lg"
        className="fill-current"
        icon={faProductHunt}
      />
    </a> */}

    <a
      className="flex items-center text-gray-500 hover:text-gray-700 mr-3"
      href="https://github.com/scalar-dev/beampipe"
    >
      <FontAwesomeIcon size="lg" className="fill-current" icon={faGithub} />
    </a>
  </div>
);

export const IfUserLoggedIn: React.FunctionComponent = ({ children }) => {
  const user = useContext(UserContext);
  return user.user ? <>{children}</> : null;
};

export const IfAnonymous: React.FunctionComponent = ({ children }) => {
  const user = useContext(UserContext);
  return user.user ? null : <>{children}</>;
};

export const Layout: FunctionComponent<LayoutProps> = ({ title, children }) => {
  const user = useContext(UserContext);
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-gray-100">
        <div className="container m-auto">
          <nav className="flex items-center justify-between flex-wrap py-4">
            <div className="flex items-center flex-shrink-0 text-black mr-6">
              <span className="font-extrabold text-green-600 hover:text-green-500 text-3xl tracking-tight align-middle">
                <a href={process.env.REACT_APP_WEBSITE_URL}>
                  <FontAwesomeIcon
                    size="sm"
                    className="fill-current mr-2"
                    icon={faAsterisk}
                  />
                  beampipe
                </a>
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
              <div className="lg:flex-grow flex flex-wrap">
                <div>
                  <IfUserLoggedIn>
                    <NavLink
                      to="/"
                      onClick={() => setMenuVisible((visible) => !visible)}
                    >
                      Dashboard
                    </NavLink>
                  </IfUserLoggedIn>
                </div>

                <div>
                  <IfAnonymous>
                    <a
                      href={`${process.env.REACT_APP_WEBSITE_URL}/#pricing`}
                      className={NAV_LINK_CLASS}
                      onClick={() => {
                        setMenuVisible((visible) => !visible);
                        window.beampipe("view_pricing");
                      }}
                    >
                      Pricing
                    </a>
                  </IfAnonymous>
                </div>

                <div>
                  <a
                    className={NAV_LINK_CLASS}
                    href={`${process.env.REACT_APP_WEBSITE_URL}/blog`}
                    onClick={() => setMenuVisible((visible) => !visible)}
                  >
                    Blog
                  </a>
                </div>

                <div>
                  <a
                    href="https://docs.beampipe.io"
                    className={NAV_LINK_CLASS}
                    target="_new"
                    onClick={() => setMenuVisible((visible) => !visible)}
                  >
                    Docs
                  </a>
                </div>

                <div>
                  <a
                    href="mailto:hello@beampipe.io"
                    className={NAV_LINK_CLASS}
                    onClick={() => setMenuVisible((visible) => !visible)}
                  >
                    Contact us
                  </a>
                </div>
              </div>

              <div className="pr-2 flex flex-row items-center">
                <IfUserLoggedIn>
                  <div className="p-4 lg:p-0">
                    <Avatar user={user.user!!} />
                  </div>
                </IfUserLoggedIn>
                <IfAnonymous>
                  <NavLink
                    to="/sign-in"
                    onClick={() => setMenuVisible((visible) => !visible)}
                  >
                    Login
                  </NavLink>
                  <div className="block mt-4 ml-4 lg:ml-0 mb-4 lg:inline-block lg:mt-0 lg:mb-0">
                    <Link
                      to="/sign-up"
                      className={`rounded-lg px-4 xl:px-4 py-3 xl:py-3 ${colorForIntent(
                        "primary"
                      )} text-base text-white font-semibold leading-tight shadow-md mr-2`}
                      onClick={() => setMenuVisible((visible) => !visible)}
                    >
                      Sign up
                    </Link>
                  </div>
                </IfAnonymous>
              </div>
              <div className="flex flex-col items-center">
                <SocialButtons />
                <a
                  className={NAV_LINK_CLASS}
                  href="https://www.scalar.dev"
                  onClick={() => setMenuVisible((visible) => !visible)}
                >
                  scalar.dev
                </a>
              </div>
            </div>
          </nav>
        </div>

        <div>{children}</div>
      </div>
    </>
  );
};

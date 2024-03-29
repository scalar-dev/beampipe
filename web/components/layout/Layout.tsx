import { FunctionComponent, useState, forwardRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { faAsterisk } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnchorButton } from "../Buttons";
import {
  faGithub,
  faTwitter,
  faMedium,
} from "@fortawesome/free-brands-svg-icons";

interface LayoutProps {
  title: string;
}

interface NavLinkProps
  extends React.DetailedHTMLProps<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  > {}

const NAV_LINK_CLASS = "text-sm block mt-4 ml-4 lg:ml-0 lg:inline-block lg:mt-0 font-semibold text-gray-600 hover:text-gray-900 mr-4"

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ children, className, ...otherProps }, ref) => (
    <a
      ref={ref}
      className={`${NAV_LINK_CLASS}
        ${className || ""}`}
      {...otherProps}
    >
      {children}
    </a>
  )
);
NavLink.displayName = "NavLink";

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
      href="https://medium.com/beampipe"
    >
      <FontAwesomeIcon size="lg" className="fill-current" icon={faMedium} />
    </a>

    {/* <a
      className="block flex items-center text-gray-500 hover:text-gray-700 mr-3"
      href="https://www.producthunt.com/posts/beampipe"
    >
      <FontAwesomeIcon
        size="lg"
        className="fill-current"
        icon={faProductHunt}
      />
    </a> */}

    <a
      className="block flex items-center text-gray-500 hover:text-gray-700 mr-3"
      href="https://github.com/scalar-dev/beampipe"
    >
      <FontAwesomeIcon size="lg" className="fill-current" icon={faGithub} />
    </a>
  </div>
);

const metaDescription = `beampipe is a simple, privacy-focussed alternative to Google Analytics with a free tier for small sites.
`;

export const Layout: FunctionComponent<LayoutProps> = ({ title, children }) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const fullTitle = `beampipe.io | ${title}`;

  return (
    <>
      <Head>
        <title>{fullTitle}</title>
        <link rel="icon" href="/static/favicon.ico" />
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={metaDescription} />
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
                      className="fill-current mr-2"
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
              <div className="lg:flex-grow flex flex-wrap">
                <div>
                  <Link href="/#pricing" passHref>
                    <NavLink
                      onClick={() => {
                        setMenuVisible((visible) => !visible);
                        window.beampipe("view_pricing");
                      }}
                    >
                      Pricing
                    </NavLink>
                  </Link>
                </div>

                <div>
                  <NavLink
                    href="/blog"
                    onClick={() => setMenuVisible((visible) => !visible)}
                  >
                    Blog
                  </NavLink>
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
                <NavLink
                  href="https://app.beampipe.io/"
                  onClick={() => setMenuVisible((visible) => !visible)}
                >
                  Login
                </NavLink>
                <div className="block mt-4 ml-4 lg:ml-0 mb-4 lg:inline-block lg:mt-0 lg:mb-0">
                  <AnchorButton
                    href="https://app.beampipe.io/sign-up"
                    className="mr-2"
                    onClick={() => setMenuVisible((visible) => !visible)}
                  >
                    Sign up
                  </AnchorButton>
                </div>
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

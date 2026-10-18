import { FunctionComponent, PropsWithChildren, useContext, useState } from "react";
import { Link, LinkProps } from "react-router-dom";
import { MenuIcon } from "lucide-react";
import { Logo } from "@beampipe/components";
import { Avatar } from "./Avatar";
import { UserContext } from "../../utils/auth";
import { Button } from "@/components/ui/button";
import { SCALAR_CONTACT_URL, SCALAR_URL } from "../../scalar";

interface LayoutProps {
  title: string;
}

const NAV_LINK_CLASS =
  "block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted md:inline-block md:p-0 md:text-sm md:text-muted-foreground md:hover:bg-transparent md:hover:text-foreground transition-colors";

const NavLink: React.FC<PropsWithChildren<LinkProps>> = ({
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

export const IfUserLoggedIn: React.FunctionComponent<PropsWithChildren> = ({ children }) => {
  const user = useContext(UserContext);
  return user.user ? <>{children}</> : null;
};

export const IfAnonymous: React.FunctionComponent<PropsWithChildren> = ({ children }) => {
  const user = useContext(UserContext);
  return user.user ? null : <>{children}</>;
};

export const Layout: FunctionComponent<PropsWithChildren<LayoutProps>> = ({ children }) => {
  const user = useContext(UserContext);
  const [menuVisible, setMenuVisible] = useState(false);
  const closeMenu = () => setMenuVisible(false);

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <nav className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-10">
            <a
              href={import.meta.env.VITE_WEBSITE_URL}
              className="text-2xl font-extrabold tracking-tight text-primary hover:text-primary/80"
              title={`beampipe ${__APP_VERSION__}`}
            >
              <Logo />
            </a>

            <div className="hidden items-center gap-7 md:flex">
              <NavLinks onClick={closeMenu} />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <IfUserLoggedIn>
              <Avatar user={user.user!!} />
            </IfUserLoggedIn>

            <IfAnonymous>
              <div className="hidden items-center gap-5 md:flex">
                <NavLink to="/sign-in">Log in</NavLink>
                <Button asChild>
                  <Link to="/sign-up">Sign up free</Link>
                </Button>
              </div>
            </IfAnonymous>

            <Button
              variant="ghost"
              size="icon"
              className="-mr-2 md:hidden"
              aria-expanded={menuVisible}
              onClick={() => setMenuVisible((visible) => !visible)}
            >
              <span className="sr-only">Toggle menu</span>
              <MenuIcon className="size-5" />
            </Button>
          </div>
        </nav>

        {menuVisible && (
          <div className="border-t bg-background md:hidden">
            <div className="space-y-1 px-4 py-3">
              <NavLinks onClick={closeMenu} />
            </div>
            <IfAnonymous>
              <div className="flex items-center gap-3 border-t px-4 py-4">
                <Button asChild variant="outline" className="flex-1">
                  <Link to="/sign-in" onClick={closeMenu}>
                    Log in
                  </Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link to="/sign-up" onClick={closeMenu}>
                    Sign up free
                  </Link>
                </Button>
              </div>
            </IfAnonymous>
          </div>
        )}
      </header>

      <div>{children}</div>

      <IfUserLoggedIn>
        <footer className="container mx-auto px-4 pb-8 text-center text-xs text-muted-foreground">
          <ScalarCredit />
        </footer>
      </IfUserLoggedIn>
    </div>
  );
};

const NavLinks = ({ onClick }: { onClick: () => void }) => (
  <>
    <IfUserLoggedIn>
      <NavLink to="/" onClick={onClick}>
        Dashboard
      </NavLink>
    </IfUserLoggedIn>

    <IfAnonymous>
      <a
        href={`${import.meta.env.VITE_WEBSITE_URL}/#pricing`}
        className={NAV_LINK_CLASS}
        onClick={() => {
          onClick();
          window.beampipe("view_pricing");
        }}
      >
        Pricing
      </a>
    </IfAnonymous>

    <a
      className={NAV_LINK_CLASS}
      href={`${import.meta.env.VITE_WEBSITE_URL}/blog`}
      onClick={onClick}
    >
      Blog
    </a>

    <a
      href="https://docs.beampipe.io"
      className={NAV_LINK_CLASS}
      target="_blank"
      rel="noreferrer"
      onClick={onClick}
    >
      Docs
    </a>

    <a href="mailto:hello@beampipe.io" className={NAV_LINK_CLASS} onClick={onClick}>
      Contact
    </a>
  </>
);

export const ScalarCredit = () => (
  <>
    beampipe is built by{" "}
    <a href={SCALAR_URL} className="font-medium text-foreground hover:text-primary">
      Scalar
    </a>
    . Need help with data or AI?{" "}
    <a href={SCALAR_CONTACT_URL} className="font-medium text-primary hover:text-primary/80">
      Work with us
    </a>
  </>
);

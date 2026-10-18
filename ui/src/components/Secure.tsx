import { PropsWithChildren, useContext, useEffect } from "react";
import { Navigate, useNavigate } from "react-router";
import { UserContext } from "../utils/auth";

export const Secure: React.FC<PropsWithChildren> = ({ children }) => {
  const { user, loading } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/sign-up");
    }
  }, [loading, user, navigate]);

  return !loading && user ? <>{children}</> : null;
};

// For pages that only make sense when signed out (sign in, sign up). Visitors
// who already have a session, e.g. arriving from the marketing site's "Log in"
// button, go straight to their dashboard.
export const AnonymousOnly: React.FC<PropsWithChildren> = ({ children }) => {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return null;
  }

  return user ? <Navigate to="/" replace /> : <>{children}</>;
};

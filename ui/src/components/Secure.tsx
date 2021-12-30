import { useContext, useEffect } from "react";
import { useNavigate } from "react-router";
import { UserContext } from "../utils/auth";

export const Secure: React.FC = ({ children }) => {
  const { user, loading } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/sign-up");
    }
  }, [loading, user]);

  return !loading && user ? <>{children}</> : null;
};

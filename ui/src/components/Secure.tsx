import { useContext } from "react";
import { useNavigate } from "react-router";
import { UserContext } from "../utils/auth";

export const Secure: React.FC = ({ children }) => {
  const { user, loading } = useContext(UserContext);
  const navigate = useNavigate();

  if (!loading && !user) {
    navigate(`/sign-up`);
  }

  return <>{children}</>;
};

import "../styles/index.css";
import { AppProps } from "next/app";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { UserContext } from "../utils/auth";
config.autoAddCss = false;

export default ({ Component, pageProps }: AppProps) => {
  const { user, ...otherProps } = pageProps;

  return (
    <UserContext.Provider value={user}>
      <Component {...otherProps} />
    </UserContext.Provider>
  );
};

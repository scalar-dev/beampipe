import "../styles/index.css";
import { AppProps } from "next/app";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { UserContext } from "../utils/auth";
config.autoAddCss = false;

const App = ({ Component, pageProps }: AppProps) => {
  const { user, ...otherProps } = pageProps;

  return (
    <UserContext.Provider value={user}>
      <Component {...otherProps} />
    </UserContext.Provider>
  );
};

export default App;
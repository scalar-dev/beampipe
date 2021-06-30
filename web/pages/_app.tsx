import "../styles/globals.css";
import { AppProps } from "next/app";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

const App = ({ Component, pageProps }: AppProps) => {
  const { user, ...otherProps } = pageProps;

  return (
      <Component {...otherProps} />
  );
};

export default App;

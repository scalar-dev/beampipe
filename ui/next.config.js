// https://stackoverflow.com/questions/65974337/import-es-module-in-next-js-err-require-esm
const withTM = require('next-transpile-modules')(['d3', 'internmap']);

module.exports = withTM({
  reactStrictMode: true,
   async rewrites() {
    return process.env.NODE_ENV === "development"
      ? [
          {
            source: "/graphql",
            destination: "http://localhost:8080/graphql",
          },
          {
            source: "/login",
            destination: "http://localhost:8080/login",
          },
          {
            source: "/oauth/:path*",
            destination: "http://localhost:8080/oauth/:path*",
          },
        ]
      : [];
  },
});

import Link from "next/link";
import { Layout } from "../components/Layout";
import { withUrql } from "../utils/withUrql";
import _ from "lodash";
import { AuthProvider, UserContext } from "../utils/auth";
import { useContext } from "react";

export const Hero = () => {
  const user = useContext(UserContext);

  return (
    <div className="pt-12">
      <div className="container px-3 mx-auto flex flex-wrap flex-col md:flex-row items-center">
        <div className="flex flex-col w-full md:w-full justify-center items-start text-center md:text-left">
          <h1 className="my-4 text-5xl font-bold leading-tight">
            dead simple web analytics
          </h1>
          <p className="leading-normal text-2xl mb-8">
            poisson offers simple, privacy-preserving web analytics starting
            from £0
          </p>

          {user?.loggedIn ? (
            <Link href="/app">
              <button className="mx-auto lg:mx-0 hover:underline bg-white text-gray-800 font-bold rounded-full my-6 py-4 px-8 shadow-lg">
                Go to app
              </button>
            </Link>
          ) : (
            <Link href="/sign-up">
              <button className="mx-auto lg:mx-0 hover:underline bg-white text-gray-800 font-bold rounded-full my-6 py-4 px-8 shadow-lg">
                Sign up free today!
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

const IndexPage = () => {
  return (
    <AuthProvider>
      <Layout title="poisson.dev | dead simple web analytics">
        <Hero />
      </Layout>
    </AuthProvider>
  );
};

export default withUrql(IndexPage);

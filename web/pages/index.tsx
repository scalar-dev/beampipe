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
          <h1 className="my-4 text-6xl font-extrabold">
            dead simple web analytics
          </h1>
          <p className="leading-normal text-2xl mb-8">
            beampipe offers simple, privacy-focussed web analytics free for upto
            10k monthly page views.
          </p>

          {user?.loggedIn ? (
            <Link href="/app">
              <button className="mx-auto lg:mx-0 hover:underline bg-white text-gray-800 font-bold rounded-full my-6 py-4 px-8 shadow-lg">
                Go to app
              </button>
            </Link>
          ) : (
            <Link href="/sign-up">
              <button className="mx-auto lg:mx-0 hover:underline bg-white text-gray-800 font-bold rounded-full my-2 py-4 px-8 shadow-lg">
                Sign up free today!
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

interface PricingBoxProps {
  title: string;
  price: React.ReactNode;
}

const PricingBox: React.FunctionComponent<PricingBoxProps> = ({
  title,
  price,
  children,
}) => {
  return (
    <div className="flex flex-col mt-4 rounded-lg shadow-lg overflow-hidden lg:mt-0">
      <div className="px-6 py-8 bg-white">
        <div className="text-2xl font-bold">{title}</div>
        <div className="text-4xl pt-2 leading-none font-extrabold">{price}</div>
      </div>

      <div className="flex flex-1 flex-col px-6 pt-6 pb-8 bg-gray-50">
        <div className="flex-1">{children}</div>

        <div className="pt-2">
          <button className="mx-auto lg:mx-0 hover:underline bg-white text-gray-800 font-bold rounded-full my-6 py-4 px-8 shadow-lg">
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

const Features = () => (
  <div className="pt-8">
    <div className="mx-auto text-6xl font-extrabold py-4">Features</div>

    <div className="mx-auto md:grid md:grid-cols-3 md:gap-5">
      <div className="mt-4 rounded-lg shadow-lg bg-white p-8">
        <div className="text-xlarge font-extrabold">
          Full featured web analytics dashboard
        </div>
      </div>

      <div className="mt-4 rounded-lg shadow-lg bg-white p-8">
        <div className="text-xlarge font-extrabold">
          Light-weight tracking script. No cookies.
        </div>
      </div>

      <div className="mt-4 rounded-lg shadow-lg bg-white p-8">
        <div className="text-xlarge font-extrabold">
          Compliant with GDPR, PECR, CCPA.
        </div>
      </div>

      <div className="mt-4 rounded-lg shadow-lg bg-white p-8">
        <div className="text-xlarge font-extrabold">
          Full featured GraphQL API for data access.
        </div>
      </div>

      <div className="mt-4 rounded-lg shadow-lg bg-white p-8">
        <div className="text-xlarge font-extrabold">Goals and conversions.</div>
      </div>

      <div className="mt-4 rounded-lg shadow-lg bg-white p-8">
        <div className="text-xlarge font-extrabold">
          Slack integration (Enterprise)
        </div>
      </div>
    </div>
  </div>
);

const Pricing = () => {
  return (
    <div className="pt-8">
      <div className="mx-auto text-6xl font-extrabold py-4">Pricing</div>
      <div className="mx-auto md:grid md:grid-cols-3 md:gap-5">
        <PricingBox title="Free" price="$0 / month">
          <ul>
            <li>5 domains</li>
            <li>10k page views per month</li>
            <li>Powerful analytics tools</li>
          </ul>
        </PricingBox>

        <PricingBox title="Pro" price="$10 / month">
          <ul>
            <li>20 domains</li>
            <li>100k page views per month</li>
            <li>Powerful analytics tools</li>
            <li>Advanced analytics: conversions, A/B testing</li>
          </ul>
        </PricingBox>

        <PricingBox title="Enterprise" price="Contact us">
          <ul>
            <li>unlimited domains</li>
            <li>unlimited page views per month</li>
            <li>Powerful analytics tools</li>
            <li>Advanced analytics: conversions, A/B testing</li>
            <li>Slack integration</li>
          </ul>
        </PricingBox>
      </div>
    </div>
  );
};

const IndexPage = () => {
  return (
    <AuthProvider>
      <Layout title="beampipe.io | dead simple web analytics">
        <Hero />
        <Features />
        <Pricing />

        <div className="py-8 text-right">
          Copyright © Sparrow Technologies 2020
        </div>
      </Layout>
    </AuthProvider>
  );
};

export default withUrql(IndexPage);

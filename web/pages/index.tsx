import Link from "next/link";
import { Layout } from "../components/Layout";
import { withUrql } from "../utils/withUrql";
import _ from "lodash";
import { AuthProvider, UserContext } from "../utils/auth";
import { useContext } from "react";
import { Tick } from "../components/Tick";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine, IconDefinition, faCookieBite, faClipboardList, faProjectDiagram, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { faSlack } from "@fortawesome/free-brands-svg-icons";

export const Hero = () => {
  const user = useContext(UserContext);

  return (
    <div className="py-12 bg-green-600 text-white">
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
            <div className="flex flex-gap">
              <Link href="/sign-up">
                <button className="mx-2 hover:underline bg-white text-gray-800 font-bold rounded-full my-2 py-4 px-8 shadow-lg">
                  Sign up free
                </button>
              </Link>
              <Link href="/domain/beampipe.io">
                <button className="mx-2 hover:underline bg-white text-gray-800 font-bold rounded-full my-2 py-4 px-8 shadow-lg">
                  Live demo
                </button>
              </Link>
            </div>
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

        <div className="pt-4">
          <Link href="/sign-up">
            <a className="mx-auto lg:mx-0 hover:underline bg-white text-gray-800 font-bold rounded-full my-6 py-4 px-8 shadow-lg">
              Sign up
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};

const FeatureCard: React.FunctionComponent<{ icon: IconDefinition }> = ({
  icon,
  children,
}) => (
  <div className="flex mt-4 rounded-lg shadow-lg bg-white p-8">
    <div>
      <FontAwesomeIcon
        size="2x"
        className="fill-current w-4 h-4 mr-2"
        icon={icon}
      />
    </div>
    <div className="text-xlarge font-extrabold">{children}</div>
  </div>
);

const Features = () => (
  <div className="pt-8">
    <div className="container mx-auto">
      <div className="mx-auto text-6xl font-extrabold py-4">Features</div>

      <div className="mx-auto md:grid md:grid-cols-3 md:gap-5">
        <FeatureCard icon={faChartLine}>
          Full featured web analytics dashboard
        </FeatureCard>

        <FeatureCard icon={faCookieBite}>
          Light-weight tracking script. No cookies.
        </FeatureCard>

        <FeatureCard icon={faClipboardList}>
          Compliant with GDPR, PECR, CCPA.
        </FeatureCard>

        <FeatureCard icon={faProjectDiagram}>
          Full featured GraphQL API for data access.
        </FeatureCard>

        <FeatureCard icon={faCheckCircle}>Goals and conversions.</FeatureCard>

        <FeatureCard icon={faSlack}>Slack integration (Enterprise)</FeatureCard>
      </div>
    </div>
  </div>
);

const Bullet: React.FunctionComponent = ({ children }) => (
  <li className="flex py-2">
    <Tick />
    <div className="pl-2">{children}</div>
  </li>
);

const Pricing = () => {
  return (
    <div className="pt-8">
      <div className="container mx-auto">
        <div className="mx-auto text-6xl font-extrabold py-4">Pricing</div>
        <div className="mx-auto md:grid md:grid-cols-3 md:gap-5">
          <PricingBox title="Free" price="$0 / month">
            <ul>
              <Bullet>5 domains</Bullet>
              <Bullet>10k page views per month</Bullet>
              <Bullet>Powerful analytics tools</Bullet>
            </ul>
          </PricingBox>

          <PricingBox title="Pro" price="$10 / month">
            <ul>
              <Bullet>20 domains</Bullet>
              <Bullet>100k page views per month</Bullet>
              <Bullet>Powerful analytics tools</Bullet>
            </ul>
          </PricingBox>

          <PricingBox title="Enterprise" price="Contact us">
            <ul>
              <Bullet>unlimited domains</Bullet>
              <Bullet>unlimited page views per month</Bullet>
              <Bullet>Powerful analytics tools</Bullet>
              <Bullet>Slack integration</Bullet>
            </ul>
          </PricingBox>
        </div>
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
          <div className="container mx-auto">
            Copyright © Sparrow Technologies 2020
          </div>
        </div>
      </Layout>
    </AuthProvider>
  );
};

export default withUrql(IndexPage);

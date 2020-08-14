import Link from "next/link";
import { Layout } from "../components/Layout";
import { withUrql } from "../utils/withUrql";
import _ from "lodash";
import { AuthProvider, UserContext } from "../utils/auth";
import { useContext } from "react";
import { Tick } from "../components/Tick";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  IconDefinition,
  faCookieBite,
  faClipboardList,
  faProjectDiagram,
  faCheckCircle,
  faAt,
  faClipboardCheck,
} from "@fortawesome/free-solid-svg-icons";
import {
  faSlack,
  faTwitter,
  faProductHunt,
  faMedium,
} from "@fortawesome/free-brands-svg-icons";
import { Laptop } from "../components/Laptop";

export const Hero = () => {
  const user = useContext(UserContext);

  return (
    <div className="py-12 bg-green-600 text-white text-center">
      <div className="container px-3 mx-auto flex flex-wrap flex-col md:flex-row items-center">
        <div className="flex flex-col w-full justify-center items-center text-center">
          <h1 className="my-4 text-6xl font-extrabold">
            dead simple web analytics
          </h1>
          <p className="leading-normal text-2xl mb-8">
            beampipe offers <b>simple</b>, <b>privacy-focussed</b> web
            analytics. <b>free</b> for upto 10k monthly page views.
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
  title: React.ReactNode;
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

        <div className="pt-4 w-full flex justify-center">
          <Link href="/sign-up">
            <a className="text-center rounded-lg px-12 py-4 hover:bg-purple-500 bg-purple-600 text-white text-2xl font-semibold leading-tight shadow-md">
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
      <div className="mx-auto text-6xl text-center font-extrabold py-4 text-purple-600">
        Features
      </div>

      <div className="mx-auto md:grid md:grid-cols-2 md:gap-5 text-gray-800">
        <FeatureCard icon={faChartLine}>
          Full featured web analytics dashboard
          <p className="text-gray-600 font-normal">
            We show you only what you need to know. No more scrolling through
            endless reports.
          </p>
        </FeatureCard>

        <FeatureCard icon={faCookieBite}>
          Light-weight tracking script. No cookies.
          <p className="text-gray-600 font-normal">
            Our tracker script is tiny and doesn't use Cookies. This means a
            faster loading page and happier users.
          </p>
        </FeatureCard>

        <FeatureCard icon={faClipboardList}>
          Compliant with GDPR, PECR, CCPA.
          <p className="text-gray-600 font-normal">
            No more data compliance headaches. We don't track your users'
            personal information.
          </p>
        </FeatureCard>

        <FeatureCard icon={faProjectDiagram}>
          Full featured GraphQL API for data access.
          <p className="text-gray-600 font-normal">
            The analytics data is yours. Filter and fetch it easily with our
            GraphQL API.
          </p>
        </FeatureCard>

        <FeatureCard icon={faCheckCircle}>
          Goals and conversions.
          <p className="text-gray-600 font-normal">
            Use our simple javascript API to log events from your site. Track
            logins, sign-ups and everything else. Better understand your users
            and tighten sales funnels.
          </p>
        </FeatureCard>

        <FeatureCard icon={faSlack}>
          Slack integration (Pro)
          <p className="text-gray-600 font-normal">
            Our Slack integration can notify you whenever a user signs up to
            your product. For more established teams, receive a daily or weekly
            report for your site.
          </p>
        </FeatureCard>
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

const GreenTag: React.FunctionComponent = ({ children }) => (
  <span className="text-sm font-medium bg-green-100 py-1 px-2 rounded text-green-500 align-middle">
    {children}
  </span>
);

const Pricing = () => {
  return (
    <div className="p-8">
      <div className="container mx-auto text-gray-800">
        <div className="mx-auto text-6xl font-extrabold py-4 text-center text-purple-600">
          Pricing
        </div>
        <p className="text-center pb-4 text-gray-600 font-bold">
          No credit card required. Cancel at any time.
        </p>
        <div className="mx-auto md:grid md:grid-cols-3 md:gap-5">
          <PricingBox title="Free" price="$0 / month">
            <ul>
              <Bullet>5 domains</Bullet>
              <Bullet>10k page views per month</Bullet>
              <Bullet>Powerful analytics tools</Bullet>
            </ul>
          </PricingBox>

          <PricingBox
            title={
              <>
                Pro <GreenTag>7 day free trial</GreenTag>
              </>
            }
            price="$10 / month"
          >
            <ul>
              <Bullet>20 domains</Bullet>
              <Bullet>100k page views per month</Bullet>
              <Bullet>Powerful analytics tools</Bullet>
              <Bullet>Slack integration</Bullet>
            </ul>
          </PricingBox>

          <PricingBox
            title={
              <>
                Enterprise <GreenTag>7 day free trial</GreenTag>
              </>
            }
            price={
              <a
                className="hover:text-gray-500"
                href="mailto:hello@beampipe.io"
              >
                Contact us
              </a>
            }
          >
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

const Footer = () => (
  <footer className="bg-green-600 text-white mt-16">
    <div className="container mx-auto  px-8">
      <div className="w-full flex flex-col md:flex-row pt-6">
        <div className="flex-1 mb-6">
          <a
            className="no-underline hover:no-underline font-bold text-2xl lg:text-4xl"
            href="#"
          >
            beampipe
          </a>
        </div>

        <div className="flex-1">
          <p className="uppercase font-extrabold md:mb-6">Links</p>
          <ul className="list-reset mb-6">
            <li className="mt-2 inline-block mr-2 md:block md:mr-0">
              <Link href="/privacy">
                <a target="_new" className="no-underline hover:underline">
                  <FontAwesomeIcon
                    className="fill-current w-4 h-4 mr-2"
                    icon={faClipboardCheck}
                  />
                  Privacy policy
                </a>
              </Link>
            </li>
            <li className="mt-2 inline-block mr-2 md:block md:mr-0">
              <a
                href="mailto:hello@beampipe.io"
                className="no-underline hover:underline"
              >
                <FontAwesomeIcon
                  className="fill-current w-4 h-4 mr-2"
                  icon={faAt}
                />
                Contact us
              </a>
            </li>
          </ul>
        </div>

        <div className="flex-1">
          <p className="uppercase font-extrabold md:mb-6">Social</p>
          <ul className="list-reset mb-6">
            <li className="mt-2 inline-block mr-2 md:block md:mr-0">
              <a
                href="https://twitter.com/beampipe_io"
                className="no-underline hover:underline"
              >
                <FontAwesomeIcon
                  className="fill-current w-4 h-4 mr-2"
                  icon={faTwitter}
                />
                Twitter
              </a>
            </li>
            <li className="mt-2 inline-block mr-2 md:block md:mr-0">
              <a
                href="https://www.producthunt.com/posts/beampipe"
                className="no-underline hover:underline"
              >
                <FontAwesomeIcon
                  className="fill-current w-4 h-4 mr-2"
                  icon={faProductHunt}
                />
                Product Hunt
              </a>
            </li>

            <li className="mt-2 inline-block mr-2 md:block md:mr-0">
              <a
                href="https://medium.com/beampipe"
                className="no-underline hover:underline"
              >
                <FontAwesomeIcon
                  className="fill-current w-4 h-4 mr-2"
                  icon={faMedium}
                />
                Medium
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="pb-6 text-center w-full text-sm">
        Copright © Beampipe 2020
      </div>
    </div>
  </footer>
);

const LaptopThing = () => (
  <div className="container mx-auto">
    <div className="px-2 py-4 md:w-full flex flex-col">
      <div className="text-6xl py-8 text-purple-600 font-extrabold text-center">
        Simple. Powerful. Private.
      </div>
      <Laptop />
    </div>
    <div className="flex flex-col">
      <div className="m-auto py-8">
        <Link href="/sign-up">
          <a className="rounded-lg p-6 hover:bg-purple-500 bg-purple-600 text-white text-3xl font-semibold leading-tight shadow-md">
            Get started now.
          </a>
        </Link>
      </div>
      <div className="m-auto py-8">
        <a
          href="https://www.producthunt.com/posts/beampipe?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-beampipe"
          target="_blank"
        >
          <img
            src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=225181&theme=light"
            alt="Beampipe - Simple, privacy-focussed web analytics. Free sign up. | Product Hunt Embed"
            style={{ width: "250px", height: "54px" }}
            width="250px"
            height="54px"
          />
        </a>
      </div>
    </div>
  </div>
);

const IndexPage = () => {
  return (
    <AuthProvider>
      <Layout title="beampipe.io | dead simple web analytics">
        <Hero />
        <LaptopThing />

        <Features />
        <Pricing />

        <Footer />
      </Layout>
    </AuthProvider>
  );
};

export default withUrql(IndexPage);

import Link from "next/link";
import {
  Layout,
  IfUserLoggedIn,
  IfAnonymous,
} from "../components/layout/Layout";
import { withUrql } from "../utils/withUrql";
import _ from "lodash";
import { AuthProvider } from "../utils/auth";
import { Tick } from "../components/marketing/Tick";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAt,
  faClipboardCheck,
  faBook,
  faCode,
  faCookieBite,
  faProjectDiagram,
  IconDefinition,
  faDollarSign,
} from "@fortawesome/free-solid-svg-icons";
import {
  faTwitter,
  faProductHunt,
  faMedium,
} from "@fortawesome/free-brands-svg-icons";
import { Screenshot } from "../components/marketing/Screenshot";
import { ReactNode } from "react";

interface PricingBoxProps {
  title: React.ReactNode;
  price: React.ReactNode;
}

const ProductHuntButton = () => (
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
);

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

const FeatureCard: React.FunctionComponent<{
  title: ReactNode;
  image: ReactNode;
}> = ({ title, image, children }) => (
  <div className="flex flex-col md:flex-row p-4 md:p-8 pb-8 text-gray-800">
    <div className="w-full md:w-1/2 md:pr-8 pb-8">
      <div className="text-4xl font-extrabold">{title}</div>
      <div className="text-xl">{children}</div>
    </div>
    <div className="w-full md:w-1/2 flex justify-end">{image}</div>
  </div>
);

const Icon: React.FunctionComponent<{ icon: IconDefinition }> = ({ icon }) => (
  <div className="text-white bg-purple-600 rounded-lg shadow-lg p-2 m-auto w-12 h-12 flex">
    <FontAwesomeIcon className="fill-current m-auto" size="lg" icon={icon} />
  </div>
);

const BulletCard: React.FunctionComponent = ({ children }) => (
  <div className="w-full md:w-1/2 p-4 md:p-8">
    <div className="flex flex-row items-start">{children}</div>
  </div>
);

const Features = () => (
  <div className="md:pt-8">
    <div className="container mx-auto">
      <FeatureCard
        title="Simple, powerful web analytics dashboard."
        image={
          <Screenshot>
            <img src="/screenshot2.png" />
          </Screenshot>
        }
      >
        <p>
          See only what you need to know. No more scrolling through endless
          reports.
        </p>

        <p className="mt-4">Your dashboard is live and updated in realtime.</p>

        <p className="mt-4">
          Easily filter by traffic source, region or time period.
        </p>
      </FeatureCard>

      <FeatureCard
        title="Slack integration."
        image={
          <Screenshot>
            <img src="/slack2.png" className="w-full" />
          </Screenshot>
        }
      >
        <p>Receive daily or weekly summary reports straight to Slack.</p>
        <p className="mt-4">
          Get notified when specific events occur e.g. sign ups or purchases.
        </p>
      </FeatureCard>

      <FeatureCard
        title="Track goals and conversions."
        image={
          <Screenshot>
            <img src="/goals.png" className="w-full m-auto" />
          </Screenshot>
        }
      >
        <p>Use our javascript SDK to record user interactions and metadata.</p>
        <p className="mt-4">
          Better understand how your product is being used, improve sales
          funnels and increase conversion rates.
        </p>
      </FeatureCard>
    </div>
  </div>
);

const Why = () => (
  <div className="container mx-auto">
    <div className="mx-auto text-6xl font-extrabold py-4 text-center text-purple-600">
      Why beampipe?
    </div>

    <div className="flex flex-wrap">
      <BulletCard>
        <div className="flex pr-4">
          <Icon icon={faCode} />
        </div>
        <div>
          <div className="text-lg font-bold">Light-weight tracking script.</div>
          <p>
            Our tracker script is tiny. This means a faster loading page and
            happier users.
          </p>
          <p className="mt-4">
            Setup is easy with just a single snippet to add to your site.
          </p>
        </div>
      </BulletCard>

      <BulletCard>
        <div className="flex pr-4">
          <Icon icon={faCookieBite} />
        </div>
        <div>
          <div className="text-lg font-bold">Privacy-focussed. No cookies.</div>
          <p>
            We do not use cookies or other personal identifiers. Our service is
            compliant with GDPR, PECR, CCPA.
          </p>
          <p className="mt-4">
            Save yourself data compliance headaches without sacrificing
            insights.
          </p>
        </div>
      </BulletCard>

      <BulletCard>
        <div className="flex pr-4">
          <Icon icon={faProjectDiagram} />
        </div>
        <div>
          <div className="text-lg font-bold">Own your data.</div>
          <p>
            Unlike Google Analytics, you maintain control over your analytics
            data.
          </p>

          <p className="mt-4">
            Export to CSV or use our GraphQL API to filter and fetch your data
            on demand.
          </p>
        </div>
      </BulletCard>

      <BulletCard>
        <div className="flex pr-4">
          <Icon icon={faDollarSign} />
        </div>
        <div>
          <div className="text-lg font-bold">Free for small sites.</div>
          <p>
            We want privacy-respecting analytics to be available to everyone. We
            offer a free tier for small sites (up to 10k page views per month).
          </p>
          <p className="mt-4">
            If you go over your usage limits due to a traffic spike, we won't
            cut you off.
          </p>
        </div>
      </BulletCard>
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
    <div className="py-8">
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
              <Bullet>Unlimited domains</Bullet>
              <Bullet>Unlimited page views per month</Bullet>
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
  <footer className="bg-green-600 text-white pt-8">
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
              <a
                href="https://docs.beampipe.io/"
                target="_blank"
                className="no-underline hover:underline"
              >
                <FontAwesomeIcon
                  className="fill-current w-4 h-4 mr-2"
                  icon={faBook}
                />
                Docs
              </a>
            </li>
            <li className="mt-2 inline-block mr-2 md:block md:mr-0">
              <Link href="/privacy">
                <a target="_blank" className="no-underline hover:underline">
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
                target="_blank"
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
                target="_blank"
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
                target="_blank"
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
        Copright © Beampipe 2020.
      </div>
    </div>
  </footer>
);

const Hero = () => (
  <div className="container mx-auto">
    <div className="px-2 pb-4 md:pt-4 md:w-full flex flex-col">
      <div className="text-6xl text-purple-600 font-extrabold text-center">
        Simple. Powerful. Private.
        <p className="leading-normal text-2xl text-gray-800 font-medium">
          beampipe offers <b>simple</b>, <b>privacy-focussed</b> web analytics.{" "}
          <b>free</b> for upto 10k monthly page views.
        </p>
      </div>
    </div>

    <div className="flex flex-col py-4">
      <div className="m-auto flex items-center justify-center">
        <IfUserLoggedIn>
          <Link href="/app">
            <a className="rounded-lg p-4 hover:bg-purple-500 bg-purple-600 text-white text-2xl font-semibold leading-tight shadow-md md:mr-4">
              Go to app
            </a>
          </Link>
        </IfUserLoggedIn>
        <IfAnonymous>
          <Link href="/sign-up">
            <a className="rounded-lg p-4 hover:bg-purple-500 bg-purple-600 text-white text-xl md:text-2xl font-semibold leading-tight shadow-md mr-2 md:mr-4">
              Sign up free
            </a>
          </Link>

          <Link href="/domain/beampipe.io">
            <a className="rounded-lg p-4 hover:bg-purple-500 bg-purple-600 text-white text-xl md:text-2xl font-semibold leading-tight shadow-md">
              Live demo
            </a>
          </Link>
        </IfAnonymous>
      </div>
    </div>
  </div>
);

const BigScreenshot = () => (
  <div className="flex py-8 px-2 md:px-32 justify-center">
    <Screenshot>
      {/* <img src="/screenshot.png" alt="Beampipe screnshot" /> */}
      <video loop autoPlay muted playsInline preload="1">
        <source type="video/mp4" src="/video.mp4" />
      </video>
    </Screenshot>
  </div>
);

const IndexPage = () => {
  return (
    <AuthProvider>
      <Layout title="dead simple web analytics">
        <div className="from-gray-100 to-white bg-gradient-to-b">
          <Hero />
          <BigScreenshot />
        </div>

        <div className="bg-white">
          <Features />
        </div>

        <div className="from-white to-gray-100 bg-gradient-to-b">
          <Why />
          <Pricing />

          <div className="flex justify-center">
            <ProductHuntButton />
          </div>
        </div>

        <Footer />
      </Layout>
    </AuthProvider>
  );
};

export default withUrql(IndexPage);

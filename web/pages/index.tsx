import Link from "next/link";
import {
  Layout,
  IfUserLoggedIn,
  IfAnonymous,
} from "../components/layout/Layout";
import { withUrql } from "../utils/withUrql";
import _ from "lodash";
import { AuthProvider } from "../utils/auth";
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
  faGithub,
} from "@fortawesome/free-brands-svg-icons";
import { Screenshot } from "../components/marketing/Screenshot";
import { ReactNode } from "react";
import { Pricing } from "../components/marketing/Pricing";

const ProductHuntButton = () => (
  <div className="m-auto py-8">
    <a
      href="https://www.producthunt.com/posts/beampipe?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-beampipe"
      target="_blank"
    >
      <img
        src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=225181&theme=dark"
        alt="Beampipe - Privacy-focussed web analytics. Free for smaller sites. | Product Hunt Embed"
        style={{ width: "250px", height: "54px" }}
        width="250"
        height="54"
      />
    </a>
  </div>
);

const FeatureCard: React.FunctionComponent<{
  title: ReactNode;
  image: ReactNode;
}> = ({ title, image, children }) => (
  <div className="flex flex-col md:flex-row p-4 md:p-8 pb-8 text-gray-800">
    <div className="w-full md:w-1/2 md:pr-8 pb-8">
      <div className="text-4xl font-black tracking-tight">{title}</div>
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
          <div className="flex justify-end">
            <Screenshot>
              <img src="/images/screenshot2.png" />
            </Screenshot>
          </div>
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
          <div className="flex justify-end">
            <Screenshot>
              <img src="/images/slack2.png" className="w-full" />
            </Screenshot>
          </div>
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
          <div className="flex justify-end">
            <Screenshot>
              <img src="/images/goals.png" className="w-full m-auto" />
            </Screenshot>
          </div>
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
    <div className="mx-auto text-6xl font-black tracking-tight py-4 text-center text-purple-600">
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
            Our tracker script is <b>tiny</b>. This means a faster loading page
            and happier users.
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
            Unlike Google Analytics, <b>you</b> maintain control over your
            analytics data.
          </p>

          <p className="mt-4">
            Export to <b>CSV</b> or use our <b>GraphQL API</b> to filter and
            fetch your data on demand.
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
            We think privacy-friendly analytics should be available to{" "}
            <b>everyone</b>. Our free tier for small sites includes up to 10k
            page views per month.
          </p>
          <p className="mt-4">
            If you are lucky enough to see a spike in traffic putting you over
            the limit, we won't cut you off.
          </p>
        </div>
      </BulletCard>
    </div>
  </div>
);

export const Footer = () => (
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
                href="https://github.com/beampipe"
                target="_blank"
                className="no-underline hover:underline"
              >
                <FontAwesomeIcon
                  className="fill-current w-4 h-4 mr-2"
                  icon={faGithub}
                />
                Github
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="pb-6 text-center w-full text-sm">
        Copyright © Beampipe 2020.
      </div>
    </div>
  </footer>
);

export const TakeBackControl = () => (
  <div className="mx-auto container py-8 text-center">
    <div className="font-black leading-tight text-5xl md:text-6xl text-gray-800">
      Take back control of your analytics.
    </div>
    <div className="pt-8">
      <Link href="/sign-up">
        <a className="rounded-lg p-4 hover:bg-purple-500 bg-purple-600 text-white text-xl md:text-2xl font-semibold leading-tight shadow-md mr-2 md:mr-4">
          Get started.
        </a>
      </Link>
    </div>
  </div>
);

const Hero = () => (
  <div className="container mx-auto">
    <div className="px-2 pb-4 md:pt-4 md:w-full flex flex-col">
      <div className="text-6xl text-purple-600 font-extrabold text-center">
        <div className="font-black tracking-tight">
          Simple. Powerful. Private.
        </div>
        <p className="leading-normal text-2xl text-gray-800 font-medium">
          beampipe is <b>simple</b>, <b>privacy-focussed</b> web analytics.{" "}
          <b>free</b> for up to 10k monthly page views.
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
      <video loop autoPlay muted playsInline preload="1" poster="/images/screenshot.png">
        <source type="video/mp4" src="/video.mp4" />
      </video>
    </Screenshot>
  </div>
);

const IndexPage = () => {
  return (
    <AuthProvider>
      <Layout title="dead simple web analytics">
        <div className="from-gray-100 via-white to-gray-100 bg-gradient-to-b">
          <Hero />
          <BigScreenshot />
        </div>

        <div className="from-gray-100 via-white to-gray-100 bg-gradient-to-b">
          <Features />
        </div>

        <div className="from-gray-100 via-white to-gray-100 bg-gradient-to-b">
          <Why />

          <TakeBackControl />

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

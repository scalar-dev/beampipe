import { Tick } from "./Tick";
import Link from "next/link";

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
    <div
      className={`flex flex-col mt-4 rounded-lg shadow-lg overflow-hidden lg:mt-0`}
    >
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

export const BasicBullets = () => (
  <ul>
    <Bullet><b>5</b> domains</Bullet>
    <Bullet><b>10k</b> page views per month</Bullet>
    <Bullet>Full-featured analytics dashboard</Bullet>
  </ul>
);

export const ProBullets = () => (
  <ul>
    <Bullet><b>10</b> domains</Bullet>
    <Bullet><b>100k</b> page views per month</Bullet>
    <Bullet>Full-featured analytics dashboard</Bullet>
    <Bullet>Slack integration</Bullet>
    <Bullet>API Access</Bullet>
    <Bullet>Email support</Bullet>
  </ul>
);

export const EnterpriseBullets = () => (
  <ul>
    <Bullet><b>Unlimited</b> domains</Bullet>
    <Bullet><b>Unlimited</b> page views per month</Bullet>
    <Bullet>Full-featured analytics dashboard</Bullet>
    <Bullet>Slack integration</Bullet>
    <Bullet>API Access</Bullet>
    <Bullet>Priority support</Bullet>
  </ul>
);

export const Pricing = () => {
  return (
    <div className="pt-8">
      <div className="container mx-auto text-gray-700">
        <div className="mx-auto text-6xl font-black tracking-tight py-4 text-center text-purple-600">
          Pricing
        </div>
        <p className="text-center pb-4 text-gray-600 font-bold">
          No credit card required. Cancel at any time.
        </p>
        <div className="mx-auto lg:grid lg:grid-cols-3 lg:gap-5">
          <PricingBox title="Free" price="$0 / month">
            <BasicBullets />
          </PricingBox>

          <PricingBox
            title={
              <>
                Pro <GreenTag>7 day free trial</GreenTag>
              </>
            }
            price="$10 / month"
          >
            <ProBullets />
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
            <EnterpriseBullets />
          </PricingBox>
        </div>
      </div>
    </div>
  );
};

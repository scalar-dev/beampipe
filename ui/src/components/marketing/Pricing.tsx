import { Tick } from "./Tick";

const Bullet: React.FunctionComponent = ({ children }) => (
  <li className="flex py-2">
    <Tick />
    <div className="pl-2">{children}</div>
  </li>
);

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

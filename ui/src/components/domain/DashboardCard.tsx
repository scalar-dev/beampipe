import { PropsWithChildren } from "react";
import { Card } from "../Card";

const cardHeight = "28rem";

export const DashboardCard: React.FunctionComponent<PropsWithChildren<{
  position: "left" | "right" | "full";
  style?: React.CSSProperties;
}>> = ({ position, style, children, ...otherProps }) => (
  <Card
    classNames={`w-full ${
      position === "left" || position === "right" ? "md:w-1/2" : ""
    } ${position === "left" ? "md:pr-4" : ""}`}
    style={{ height: cardHeight, ...style }}
    {...otherProps}
  >
    {children}
  </Card>
);
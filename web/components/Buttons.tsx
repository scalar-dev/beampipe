import { forwardRef } from "react";

interface SwitchButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  selected: Boolean;
}

export const SwitchButton: React.FunctionComponent<SwitchButtonProps> = ({
  selected,
  children,
  ...otherProps
}) => (
  <button
    className={`border-gray-300 text-xs font-bold py-2 px-4 border rounded ${
      selected ? "bg-gray-100 shadow-inner" : ""
    }`}
    {...otherProps}
  >
    {children}
  </button>
);

type Intent = "primary" | "info" | "danger";

const colorForIntent = (intent: Intent) => {
  switch (intent) {
    case "primary":
      return "bg-green-600 hover:bg-green-500";
    case "info":
      return "bg-blue-600 hover:bg-blue-500";
    case "danger":
      return "bg-red-600 hover:bg-red-500";
  }
};

interface AnchorProps
  extends React.DetailedHTMLProps<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  > {
  intent?: Intent;
}

export const AnchorButton = forwardRef<HTMLAnchorElement, AnchorProps>(
  ({ className, children, intent, href = "#", ...otherProps }, ref) => (
    <a
      {...otherProps}
      ref={ref}
      href={href}
      className={`rounded-lg px-4 xl:px-4 py-3 xl:py-3 ${colorForIntent(
        intent || "primary"
      )} text-base text-white font-semibold leading-tight shadow-md ${
        className || ""
      }`}
    >
      {children}
    </a>
  )
);
AnchorButton.displayName = "AnchorButton";

interface ButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  intent?: Intent;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, intent, ...otherProps }, ref) => (
    <button
      {...otherProps}
      ref={ref}
      className={`rounded-lg px-4 xl:px-4 py-3 xl:py-3 ${colorForIntent(
        intent || "primary"
      )} text-base text-white font-semibold leading-tight shadow-md disabled:cursor-not-allowed disabled:opacity-75 ${
        className || ""
      }`}
    >
      {children}
    </button>
  )
);
Button.displayName = "Button";

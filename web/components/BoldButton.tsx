import { forwardRef } from "react";

interface ButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  selected: Boolean;
}

interface AnchorProps
  extends React.DetailedHTMLProps<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  > {}

export const Button: React.FunctionComponent<ButtonProps> = ({
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

export const BoldButton = forwardRef<HTMLAnchorElement, AnchorProps>(
  ({ children, href = "#", ...otherProps }, ref) => (
    <a
      {...otherProps}
      ref={ref}
      href={href}
      className="inline-flex items-center justify-center px-5 py-2 border border-transparent text-base leading-6 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
    >
      {children}
    </a>
  )
);

import React from "react";

export const Pill = React.forwardRef<
  HTMLAnchorElement,
  { selected?: boolean } & React.DetailedHTMLProps<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  >
>(({ selected = false, children, ...otherProps }, ref) => (
  <li className="ml-3 flex">
    <a
      ref={ref}
      className={`transition duration-200 text-xs my-auto inline-block font-medium border-b-2 ${
        selected
          ? "text-gray-500 border-gray-300"
          : "text-gray-400 border-transparent hover:text-gray-500"
      }`}
      href="#"
      {...otherProps}
    >
      {children}
    </a>
  </li>
));

export const Pills: React.FunctionComponent = ({ children }) => (
  <ul className="flex items-center">{children}</ul>
);


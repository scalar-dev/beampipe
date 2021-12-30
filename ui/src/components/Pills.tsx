import React from "react";

export const Pill = React.forwardRef<
  HTMLButtonElement,
  { selected?: boolean } & React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >
>(({ selected = false, children, ...otherProps }, ref) => (
  <li className="ml-3 flex">
    <button
      ref={ref}
      className={`transition duration-200 text-xs my-auto inline-block font-medium border-b-2 outline-none focus:outline-none ${
        selected
          ? "text-gray-600 border-gray-400"
          : "text-gray-500 border-transparent hover:text-gray-600"
      }`}
      {...otherProps}
    >
      {children}
    </button>
  </li>
));

export const Pills: React.FunctionComponent = ({ children }) => (
  <ul className="flex items-center">{children}</ul>
);


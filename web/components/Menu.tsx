import useOnclickOutside from "react-cool-onclickoutside";

interface MenutItemProps
  extends React.DetailedHTMLProps<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  > {}

export const MenuItem: React.FunctionComponent<MenutItemProps> = ({
  children,
  ...otherProps
}) => (
  <a
    href="#"
    className="flex block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:bg-gray-100 focus:text-gray-900"
    role="menuitem"
    {...otherProps}
  >
    {children}
  </a>
);

export const MenuDivider = () => (
  <div className="border-t border-gray-100"></div>
);

export const MenuSection: React.FunctionComponent = ({ children }) => (
  <div className="py-1">{children}</div>
);

export const Menu: React.FunctionComponent<{
  value: React.ReactNode;
  visible: boolean;
  classNames?: string;
  setVisible: (visible: boolean) => void;
  align: "left" | "right";
}> = ({ value, visible, classNames, setVisible, align, children }) => {
  const ref = useOnclickOutside(() => setVisible(false));

  return (
    <div className={`relative inline-block text-left ${classNames}`} ref={ref}>
      <div>
        <span className="rounded-md shadow-sm">
          <button
            type="button"
            className="inline-flex justify-center w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-sm leading-5 font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-50 active:text-gray-800 transition ease-in-out duration-150"
            id="options-menu"
            aria-haspopup="true"
            aria-expanded="true"
            onClick={() => setVisible(!visible)}
          >
            <span className="truncate">{value}</span>
            <svg
              className="-mr-1 ml-2 h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </span>
      </div>

      {visible && (
        <div
          className={`origin-top-right absolute ${
            align == "left" ? "left-0" : "right-0"
          } mt-2 rounded-md shadow-lg z-40`}
          style={{ minWidth: "14rem" }}
        >
          <div
            className="rounded-md bg-white shadow-xs"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

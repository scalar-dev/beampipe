
interface CardProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  interactive?: boolean;
  classNames?: string;
}

export const Card: React.FunctionComponent<CardProps> = ({
  interactive = false,
  children,
  classNames,
  ...otherProps
}) => (
  <div className={`pb-4 ${classNames}`}>
    <div
      className={`flex flex-col overflow-hidden shadow-md rounded-md bg-white ${
        interactive ? "hover:bg-gray-50 cursor-pointer" : ""
      } p-4`}
      {...otherProps}
    >
      {children}
    </div>
  </div>
);

export const CardTitle: React.FunctionComponent<{}> = ({ children }) => (
  <h2 className="text-xl pb-2 font-bold text-gray-700">{children}</h2>
);
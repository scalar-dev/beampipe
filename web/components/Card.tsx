
interface CardProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  classNames?: string;
}

export const Card: React.FunctionComponent<CardProps> = ({
  children,
  classNames,
  ...otherProps
}) => (
  <div className={`pb-4 ${classNames}`}>
    <div
      className={`flex flex-col rounded overflow-hidden shadow-lg bg-white p-4`}
      {...otherProps}
    >
      {children}
    </div>
  </div>
);

export const CardTitle: React.FunctionComponent<{}> = ({ children }) => (
  <h2 className="text-xl pb-2 font-bold text-gray-800">{children}</h2>
);
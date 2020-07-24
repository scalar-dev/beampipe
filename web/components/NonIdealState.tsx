interface NonIdealStateProps {
  isIdeal: boolean;
}

export const NonIdealState: React.FunctionComponent<NonIdealStateProps> = ({
  isIdeal,
  children,
}) => (
  <>
    {isIdeal ? (
      <>{children}</>
    ) : (
      <div className="w-full h-full flex">
        <div className="text-xl text-gray-500 m-auto">No data to display</div>
      </div>
    )}
  </>
);

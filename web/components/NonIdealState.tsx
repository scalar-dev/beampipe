import { ReactNode } from "react";

interface NonIdealStateProps {
  isIdeal: boolean;
  nonIdeal?: ReactNode;
}

export const NonIdealState: React.FunctionComponent<NonIdealStateProps> = ({
  isIdeal,
  children,
  nonIdeal = <div className="text-xl text-gray-500">No data to display</div>,
}) => (
  <>
    {isIdeal ? (
      <>{children}</>
    ) : (
      <div className="w-full max-w-full h-full flex">
        <div className="m-auto max-w-full">{nonIdeal}</div>
      </div>
    )}
  </>
);

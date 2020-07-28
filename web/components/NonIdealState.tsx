import { ReactNode } from "react";
import { Spinner } from "./Spinner";

interface NonIdealStateProps {
  isIdeal: boolean;
  isLoading?: boolean;
  nonIdeal?: ReactNode;
}

export const NonIdealState: React.FunctionComponent<NonIdealStateProps> = ({
  isIdeal,
  isLoading,
  children,
  nonIdeal = <div className="text-xl text-gray-500">No data to display</div>,
}) => {
  if (isLoading) {
    return <Spinner />;
  }

  return (
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
};

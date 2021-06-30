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
  nonIdeal = (
    <div className="text-center text-xl text-gray-400">No data to display</div>
  ),
}) => {
  if (isLoading) {
    return <Spinner />;
  }

  return (
    <>
      {isIdeal ? (
        <>{children}</>
      ) : (
        <div className="flex flex-1">
          <div className="m-auto overflow-auto">{nonIdeal}</div>
        </div>
      )}
    </>
  );
};

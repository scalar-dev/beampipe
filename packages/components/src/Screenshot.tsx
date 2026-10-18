import { PropsWithChildren } from "react";

export const Screenshot: React.FunctionComponent<PropsWithChildren> = ({ children }) => {
  return (
    <div className="w-full overflow-hidden rounded-xl bg-white shadow-xl shadow-gray-900/10 ring-1 ring-gray-900/10">
      <div className="flex h-6 items-center gap-1.5 border-b border-gray-100 bg-gray-50 px-3 md:h-8">
        <span className="h-2 w-2 rounded-full bg-gray-300 md:h-2.5 md:w-2.5"></span>
        <span className="h-2 w-2 rounded-full bg-gray-300 md:h-2.5 md:w-2.5"></span>
        <span className="h-2 w-2 rounded-full bg-gray-300 md:h-2.5 md:w-2.5"></span>
      </div>

      <div className="leading-[0] [&>img]:w-full [&>video]:w-full">{children}</div>
    </div>
  );
};

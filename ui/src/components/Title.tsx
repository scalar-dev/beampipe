import React, { PropsWithChildren } from "react";

export const Title: React.FunctionComponent<PropsWithChildren> = ({ children }) => (
  <div className="text-3xl py-2 flex-1 font-extrabold text-gray-800">{children}</div>
);



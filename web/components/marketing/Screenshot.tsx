export const Screenshot: React.FunctionComponent = ({ children }) => {
  return (
    <div
      className="my-auto rounded-md border-b-2 border-r-2 pt-4 md:pt-6 inline-block bg-white relative shadow w-full lg:w-3/4 xl:w-2/3"
      style={{ lineHeight: 0 }}
    >
      <div className="absolute block top-0 left-0 h-4 md:h-6 flex items-center">
        <span className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-600 border-1 ml-2"></span>
        <span className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-600 border-1 ml-2"></span>
        <span className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-600 border-1 ml-2"></span>
      </div>

      {children}
    </div>
  );
};

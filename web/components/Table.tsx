import _ from "lodash";
import { ReactNode } from "react";

interface TableProps {
  showImages?: boolean;
  data: {
    key: string;
    count: number;
    image?: ReactNode;
  }[];
}

const Bar = ({ percentage }: { percentage: number }) => (
  <div style={{ height: "0.5rem" }}>
    <svg
      width="100%"
      height="100%"
      className="fill-current text-green-600 hover:text-green-500"
    >
      <rect width={`${100.0 * percentage}%`} height="100%"></rect>
    </svg>
  </div>
);

export const Table = ({ showImages = false, data }: TableProps) => {
  if (data.length === 0) {
    return null;
  }

  const maxCount = _.maxBy(data, "count")!.count;

  return (
    <table className="w-full table-fixed">
      <tbody>
        {data?.map((item) => (
          <tr key={item.key} className="border-t-2">
            {showImages && <td className="w-8 h-8 p-1">{item.image}</td>}
            <td className="px-4 text-xs font-mono py-1 truncate">
              {item.key || "none"}
              <Bar percentage={maxCount === 0 ? 0 : item.count / maxCount} />
            </td>
            <td className="px-4 text-right w-1/5">{item.count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

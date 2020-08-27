import _ from "lodash";
import { ReactNode } from "react";
import numeral from "numeral";

interface TableProps {
  showImages?: boolean;
  data: {
    key: string;
    reactKey?: string;
    count: number;
    image?: ReactNode;
  }[];

  showPercentages?: "max" | "sum" | null;
  columnHeadings?: [string, string];
  maxRows?: number;
}

const Bar = ({ percentage }: { percentage: number }) => (
  <div style={{ height: "0.5rem" }}>
    <svg
      width="100%"
      height="100%"
      className="fill-current text-green-600 hover:text-green-500"
    >
      <rect width={`${100.0 * percentage}%`} height="100%" rx={3}></rect>
    </svg>
  </div>
);

export const Table = ({
  showImages = false,
  data,
  showPercentages = "sum",
  columnHeadings = ["", ""],
  maxRows = 10,
}: TableProps) => {
  if (data.length === 0) {
    return null;
  }

  const maxCount = _.maxBy(data, "count")!.count;
  const sumCount = _.sumBy(data, "count")!;

  const denominator = showPercentages === "sum" ? sumCount : maxCount;

  return (
    <table className="w-full table-fixed">
      <thead>
        <tr>
          {showImages && <th className="w-6 p-1"></th>}
          <th className="text-left text-xs text-gray-600">
            {columnHeadings[0]}
          </th>
          <th className="text-right text-xs text-gray-600 w-1/5">
            {columnHeadings[1]}
          </th>
          {showPercentages && (
            <th className="text-right text-xs text-gray-600 w-12">%</th>
          )}
        </tr>
      </thead>
      <tbody>
        {data?.slice(0, maxRows).map((item) => (
          <tr key={item.reactKey || item.key} className="border-t-2">
            {showImages && <td className="w-6 p-1">{item.image}</td>}
            <td className="px-2 text-xs text-gray-800 font-medium font-mono py-1 truncate">
              {item.key || "none"}
              <Bar percentage={maxCount === 0 ? 0 : item.count / maxCount} />
            </td>
            <td className="px-2 text-right text-xs w-1/5">{item.count}</td>
            {showPercentages ? (
              <td className="text-right w-12 text-xs text-gray-600">
                {denominator > 0
                  ? numeral(item.count / denominator).format("0%")
                  : null}
              </td>
            ) : null}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

import _ from "lodash";
import { ReactNode } from "react";
import numeral from "numeral";
import Tippy from "@tippyjs/react";

interface TableData {
  key: string;
  count: number;
}

interface TableProps {
  showImages?: boolean;
  data: (TableData & {
    label: string;
    image?: ReactNode;
    onClick?: () => void;
  })[];
  drilldownData?: TableData[];
  onClick?: (key: string | null) => void;
  showPercentages?: "max" | "sum" | null;
  columnHeadings?: [string, string];
  maxRows?: number;
}

const Bar = ({
  tooltip,
  percentage,
  colour = "text-green-600 hover:text-green-500",
}: {
  tooltip: string;
  percentage: number;
  colour?: string;
}) => (
  <div
    className="absolute pointer-events-none"
    style={{ top: 0, bottom: 0, left: 0, right: 0 }}
  >
    <Tippy content={tooltip}>
      <svg
        width={`${percentage * 100.0}%`}
        height="100%"
        className={`pointer-events-auto fill-current ${colour} block`}
      >
        <rect width="100%" height="100%" rx={3}></rect>
      </svg>
    </Tippy>
  </div>
);

export const Table = ({
  showImages = false,
  data,
  drilldownData,
  showPercentages = "sum",
  columnHeadings = ["", ""],
  maxRows = 10,
  onClick,
}: TableProps) => {
  if (data.length === 0) {
    return null;
  }

  const maxCount = _.maxBy(data, "count")!.count;
  const sumCount = _.sumBy(data, "count")!;

  const denominator = showPercentages === "sum" ? sumCount : maxCount;

  const drilldownDataByKey = _.groupBy(drilldownData, "key");

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
        {data?.slice(0, maxRows).map((item, idx) => (
          <tr
            key={idx}
            className={`border-t-2 ${
              onClick || item.onClick ? "cursor-pointer hover:bg-gray-100" : ""
            }`}
            onClick={() => {
              if (onClick) {
                onClick(item.key);
              }

              if (item.onClick) {
                item.onClick();
              }
            }}
          >
            {showImages && <td className="w-6 p-1">{item.image}</td>}
            <td className="px-2 text-xs text-gray-700 font-medium font-mono py-1 truncate">
              {item.label || item.key || "none"}
              <div style={{ height: "0.5rem" }} className="w-full relative">
                <Bar
                  tooltip={`${item.label || item.key || "none"}: ${item.count}`}
                  percentage={maxCount === 0 ? 0 : item.count / maxCount}
                />
                {item.key in drilldownDataByKey ? (
                  <Bar
                    tooltip={`${
                      item.label || item.key || "none"
                    } (drilldown): ${drilldownDataByKey[item.key][0].count}`}
                    percentage={
                      maxCount === 0
                        ? 0
                        : drilldownDataByKey[item.key][0].count / maxCount
                    }
                    colour="text-purple-600 hover:text-purple-500"
                  />
                ) : null}
              </div>
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

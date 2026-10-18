import _ from "lodash";
import { ReactNode } from "react";
import numeral from "numeral";
import { cn } from "cn";
import {
  Table as UiTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
  drilldownData?: TableData[] | null;
  onClick?: (key: string | null) => void;
  showPercentages?: "max" | "sum" | null;
  columnHeadings?: [string, string];
  maxRows?: number;
}

const Bar = ({
  tooltip,
  percentage,
  className,
}: {
  tooltip: string;
  percentage: number;
  className: string;
}) => (
  <div className="pointer-events-none absolute inset-0">
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn("pointer-events-auto h-full rounded-full", className)}
          style={{ width: `${percentage * 100.0}%` }}
        />
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
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
  const hasDrilldown = drilldownData != null;

  return (
    <UiTable className="table-fixed">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {showImages && <TableHead className="h-8 w-8 px-1" />}
          <TableHead className="h-8 px-2 text-xs">{columnHeadings[0]}</TableHead>
          <TableHead className="h-8 w-1/5 px-2 text-right text-xs">
            {columnHeadings[1]}
          </TableHead>
          {showPercentages && (
            <TableHead className="h-8 w-12 px-2 text-right text-xs">%</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.slice(0, maxRows).map((item, idx) => {
          const label = item.label || item.key || "none";
          const clickable = onClick || item.onClick;

          return (
            <TableRow
              key={idx}
              className={cn(clickable ? "cursor-pointer" : "hover:bg-transparent")}
              onClick={() => {
                if (onClick) {
                  onClick(item.key);
                }

                if (item.onClick) {
                  item.onClick();
                }
              }}
            >
              {showImages && <TableCell className="w-8 px-1">{item.image}</TableCell>}
              <TableCell className="px-2 py-1.5">
                <div className="truncate font-mono text-xs text-foreground">
                  {label}
                </div>
                <div className="relative mt-1 h-1.5 w-full">
                  <Bar
                    tooltip={`${label}: ${item.count}`}
                    percentage={maxCount === 0 ? 0 : item.count / maxCount}
                    className={hasDrilldown ? "bg-primary/20" : "bg-primary/80 hover:bg-primary"}
                  />
                  {item.key in drilldownDataByKey ? (
                    <Bar
                      tooltip={`${label} (drilldown): ${drilldownDataByKey[item.key][0].count}`}
                      percentage={
                        maxCount === 0
                          ? 0
                          : drilldownDataByKey[item.key][0].count / maxCount
                      }
                      className="bg-primary hover:bg-primary/80"
                    />
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="px-2 text-right text-xs tabular-nums">
                {item.count}
              </TableCell>
              {showPercentages ? (
                <TableCell className="px-2 text-right text-xs text-muted-foreground tabular-nums">
                  {denominator > 0
                    ? numeral(item.count / denominator).format("0%")
                    : null}
                </TableCell>
              ) : null}
            </TableRow>
          );
        })}
      </TableBody>
    </UiTable>
  );
};

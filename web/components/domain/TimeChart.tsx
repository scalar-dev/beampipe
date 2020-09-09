import { TimePeriod } from "../viz/TimePicker";
import { timePeriodToFineBucket, LineChart } from "../viz/LineChart";
import { NonIdealState } from "../NonIdealState";
import _ from "lodash";
import { DashboardCard } from "./DashboardCard";

export const TimeChart = ({
  stats,
  drilldownStats,
  timePeriod,
  showDrilldown
}: {
  stats: any;
  drilldownStats: any | null;
  showDrilldown: boolean;
  timePeriod: TimePeriod;
}) => {
  const isDayMode = timePeriodToFineBucket(timePeriod) === "day";

  const data: any[] = [
    {
      data: stats.data?.events?.bucketedUnique,
      type: "bar",
      yAxisID: "visitors",
      backgroundColor: (context: any) => {
        return isDayMode &&
          context.dataset.data[context.dataIndex].x.getDay() % 6 === 0
          ? "rgba(113, 128, 150, 0.5)"
          : "rgba(203, 213, 224, 0.5)";
      },
      label: "Unique visitors",
    },
  ];

  if (showDrilldown && drilldownStats.data) {
    data.push({
      data: drilldownStats.data?.events?.bucketedUnique,
      type: "bar",
      yAxisID: "visitors",
      backgroundColor: (context: any) => {
        return isDayMode &&
          context.dataset.data[context.dataIndex].x.getDay() % 6 === 0
          ? "rgba(128, 90, 213, 0.5)"
          : "rgba(128, 90, 213, 0.5)";
      },
      label: "Unique visitors (drilldown)",
    });
  }

  return (
    <DashboardCard position="full" style={{ height: "22rem" }}>
      <NonIdealState
        isLoading={stats.fetching || drilldownStats.fetching}
        isIdeal={!_.every(stats.data?.events?.bucketed, (x) => x.count === 0)}
      >
        <LineChart
          data={data}
          timePeriod={timePeriod}
        />
      </NonIdealState>
    </DashboardCard>
  );
};
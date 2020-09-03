import { TimePeriod } from "../viz/TimePicker";
import { timePeriodToFineBucket, LineChart } from "../viz/LineChart";
import { NonIdealState } from "../NonIdealState";
import _ from "lodash";
import { DashboardCard } from "./DashboardCard";

export const TimeChart = ({
  stats,
  timePeriod,
}: {
  stats: any;
  timePeriod: TimePeriod;
}) => {
  const isDayMode = timePeriodToFineBucket(timePeriod) === "day";

  return (
    <DashboardCard position="full" style={{ height: "22rem" }}>
      <NonIdealState
        isLoading={stats.fetching}
        isIdeal={!_.every(stats.data?.events?.bucketed, (x) => x.count === 0)}
      >
        <LineChart
          data={[
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
          ]}
          timePeriod={timePeriod}
        />
      </NonIdealState>
    </DashboardCard>
  );
};
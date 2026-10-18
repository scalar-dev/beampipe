import React from "react";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { Spinner } from "../Spinner";
import numeral from "numeral";

export const NICE_NUMBER_FORMAT = "0.[0]a";

const PercentageChange: React.FunctionComponent<{
  current: number;
  previous: number;
  downIsGood?: boolean;
}> = ({ current, previous, downIsGood = false }) => {
  if (previous == null) {
    return null;
  }

  const change = previous > 0 ? (current - previous) / previous : 0;

  const color = downIsGood
    ? change >= 0
      ? "text-destructive"
      : "text-primary"
    : change >= 0
    ? "text-primary"
    : "text-destructive";

  return (
    <div className={`inline-flex items-center gap-0.5 text-xs font-medium ${color}`}>
      {change >= 0 ? (
        <ArrowUpIcon className="size-3" />
      ) : (
        <ArrowDownIcon className="size-3" />
      )}
      {numeral(Math.abs(change)).format("0%")}
    </div>
  );
};

export const StatsCounter = ({
  value,
  title,
  delta,
}: {
  value: React.ReactNode;
  title: string;
  delta: JSX.Element | null;
}) => (
  <div className="flex min-w-20 flex-1 flex-col">
    <div className="text-xs font-medium whitespace-nowrap text-muted-foreground">
      {title}
    </div>
    <div className="mt-1 text-2xl font-semibold tracking-tight text-foreground tabular-nums">
      {value}
    </div>
    {delta && <div className="mt-0.5 h-4 whitespace-nowrap">{delta}</div>}
  </div>
);

export const Stats = ({ stats }: { stats?: any }) => {
  if (!stats) {
    return (
      <div>
        <Spinner />
      </div>
    );
  }
  const bounceRate =
    stats.countUnique > 0 ? stats.bounceCount / stats.countUnique : undefined;
  const prevBounceRate =
    stats.previousCountUnique > 0
      ? stats.previousBounceCount / stats.previousCountUnique
      : undefined;

  return (
    <>
      <StatsCounter
        value={numeral(stats.count).format(NICE_NUMBER_FORMAT)}
        title="Views"
        delta={
          <PercentageChange
            current={stats.count}
            previous={stats.previousCount}
          />
        }
      />
      <StatsCounter
        value={numeral(stats.countUnique).format(NICE_NUMBER_FORMAT)}
        title="Unique"
        delta={
          <PercentageChange
            current={stats.countUnique}
            previous={stats.previousCountUnique}
          />
        }
      />
      <StatsCounter
        value={numeral(bounceRate).format("0%")}
        title="Bounce Rate"
        delta={
          bounceRate && prevBounceRate ? (
            <PercentageChange
              current={bounceRate}
              previous={prevBounceRate}
              downIsGood
            />
          ) : (
            <div className="text-xs text-muted-foreground">-</div>
          )
        }
      />
    </>
  );
};

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { Spinner } from "../Spinner";
import numeral from "numeral";

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
      ? "text-red-600"
      : "text-green-600"
    : change >= 0
    ? "text-green-600"
    : "text-red-600";

  return (
    <div className="text-sm">
      <FontAwesomeIcon
        size="sm"
        className={`fill-current w-4 h-4 mr-2 ${color}`}
        icon={change >= 0 ? faArrowUp : faArrowDown}
      />
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
  <div className="flex flex-1 flex-col text-center md:pr-8">
    <div className="text-gray-500 font-bold text-xs uppercase whitespace-no-wrap">
      {title}
    </div>
    <div className="text-3xl font-bold text-gray-800">{value}</div>
    {delta && (
      <div className="text-gray-800 font-bold whitespace-no-wrap">{delta}</div>
    )}
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
        value={numeral(stats.count).format("0.[0]a")}
        title="Views"
        delta={
          <PercentageChange
            current={stats.count}
            previous={stats.previousCount}
          />
        }
      />
      <StatsCounter
        value={numeral(stats.countUnique).format("0.[0]a")}
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
            <div className="text-sm">-</div>
          )
        }
      />
    </>
  );
};

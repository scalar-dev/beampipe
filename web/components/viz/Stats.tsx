import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { Spinner } from "../Spinner";
import numeral from "numeral";

const PercentageChange: React.FunctionComponent<{
  current: number;
  previous: number;
}> = ({ current, previous }) => {
  const change = previous > 0 ? (current - previous) / previous : 0;

  return (
    <div className="text-sm">
      <FontAwesomeIcon
        size="sm"
        className={`fill-current w-4 h-4 mr-2 ${
          change >= 0 ? "text-green-600" : "text-red-600"
        }`}
        icon={change >= 0 ? faArrowUp : faArrowDown}
      />
      {numeral(Math.abs(change)).format("0%")}
    </div>
  );
};

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
    <div>
      <div className="flex flex-row text-gray-800">
        <div className="text-2xl mr-4 font-bold">
          <span className="text-gray-500 mr-2 text-sm">total</span>
          {numeral(stats.count).format("0.[0]a")}
          <PercentageChange
            current={stats.count}
            previous={stats.previousCount}
          />
        </div>
        <div className="text-2xl mr-4 font-bold">
          <span className="text-gray-500 mr-2 text-sm">unique</span>
          {numeral(stats.countUnique).format("0.[0]a")}
          <PercentageChange
            current={stats.countUnique}
            previous={stats.previousCountUnique}
          />
        </div>

        <div className="text-2xl mr-4 font-bold">
          <span className="text-gray-500 mr-2 text-sm">bounce</span>
          {numeral(bounceRate).format("0%")}
          {bounceRate && prevBounceRate && (
            <PercentageChange current={bounceRate} previous={prevBounceRate} />
          )}
        </div>
      </div>
    </div>
  );
};

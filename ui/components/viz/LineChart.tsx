import { useRef, useEffect } from "react";
import Chart, { ChartYAxe, ChartPoint } from "chart.js";
import { TimePeriod } from "./TimePicker";
import moment, { Moment } from "moment";
import numeral from "numeral";
import { NICE_NUMBER_FORMAT } from "./Stats";
import _ from "lodash";
import { RangeSelectPlugin } from "./RangeSelect";

const timePeriodToTimeUnit = (timePeriod: TimePeriod) => {
  if (timePeriod.type === "day") return "hour";
  else if (timePeriod.type === "hour") return "minute";
  else if (timePeriod.type === "week") return "day";
  else if (timePeriod.type === "month") return "week";
  else if (timePeriod.type === "custom") {
    const durationDays = timePeriod.endTime?.diff(timePeriod.startTime, "days");

    if (durationDays!! <= 2) {
      return "hour";
    } else if (durationDays!! <= 7) {
      return "day";
    } else {
      return "week";
    }
  }
};

const timePeriodToStepSize = (timePeriod: TimePeriod) => {
  if (timePeriod.type === "hour") return 10;
  else if (timePeriod.type === "day") return 4;
  else return 1;
}

export const timePeriodToBucketDuration = (timePeriod: TimePeriod) => {
  if (timePeriod.type === "day") return "hour";
  else if (timePeriod.type === "hour") return "minute";
  else if (timePeriod.type === "custom") {
    const durationDays = timePeriod.endTime?.diff(timePeriod.startTime, "days");

    if (durationDays!! <= 2) {
      return "hour";
    } else {
      return "day";
    }
  } else return "day";
};

export const LineChart = ({
  data,
  timePeriod,
  onSelect,
}: {
  data: any[];
  timePeriod: TimePeriod;
  onSelect?: (start: Moment, end: Moment) => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chart = useRef<Chart>();

  useEffect(() => {
    chart.current = new Chart(canvasRef.current!, {
      type: "line",
      plugins: onSelect ? [RangeSelectPlugin]: [],
      options: {
        legend: undefined,
        maintainAspectRatio: false,
        scales: {},
        tooltips: {
          callbacks: {
            title: (tooltipItems, data) =>
              tooltipItems.map((tooltipItem) => {
                const date = (data?.datasets?.[tooltipItem.datasetIndex!!]
                  .data?.[tooltipItem.index!!] as ChartPoint).x as Date;
                return moment(date).format("ddd Do MMM");
              }),
          },
        },
        plugins: {
          rangeSelect: {
            onSelect
          },
          crosshair: {
            zoom: {
              enabled: onSelect != null,
            },
            line: {
              color: onSelect ? "red" : "rgba(0, 0, 0, 0)"
            },
            callbacks: {
              beforeZoom: (start: number, end: number) => {
                onSelect && onSelect(start as unknown as Moment, end as unknown as Moment);
                return false;
              },
            },
          },
        },
      },
    });
  }, []);

  useEffect(() => {
    if (chart.current && data) {
      const gradient = canvasRef.current
        ?.getContext("2d")
        ?.createLinearGradient(0, 0, 0, 400);

      gradient!.addColorStop(0, "rgba(56,161,105, 0.2)");
      gradient!.addColorStop(1, "rgba(255,255,255, 0.0)");

      chart.current.options.scales = {
        xAxes: [
          {
            type: "time",
            time: {
              unit: timePeriodToTimeUnit(timePeriod),
              stepSize: timePeriodToStepSize(timePeriod),
            },
            stacked: true,
            offset: true,
            gridLines: {
              display: false,
            },
          },
        ],
        yAxes: _.chain(data)
          .map((ds) => ds.yAxisID)
          .uniq()
          .map<ChartYAxe>(
            (yAxis: string, index: number) =>
              ({
                type: "linear",
                id: yAxis,
                position: index === 0 ? "left" : "right",
                ticks: {
                  precision: 0,
                  callback: (value) => {
                    return numeral(value).format(NICE_NUMBER_FORMAT);
                  },
                },
                gridLines: {
                  display: index === 0,
                },
              } as ChartYAxe)
          )
          .value(),
      };

      chart.current.data.datasets = data.map((dataset) => ({
        label: dataset.label,
        lineTension: 0,
        backgroundColor: dataset.backgroundColor || gradient,
        borderColor: dataset.borderColor,
        pointRadius: 5,
        pointBorderColor: "rgba(0, 0, 0, 0)",
        pointBackgroundColor: "rgba(0, 0, 0, 0)",
        type: dataset.type,
        yAxisID: dataset.yAxisID,
        data: dataset.data.map(
          ({ time, count }: { time: string; count: number }) => ({
            x: moment.parseZone(time).toDate(),
            y: count,
          })
        ),
      }));
      chart.current.update();
    }
  }, [data, chart]);

  return <canvas ref={canvasRef} />;
};

import { useRef, useEffect } from "react";
import Chart from 'chart.js/auto';
import { ScaleOptions } from "chart.js";
import 'chartjs-adapter-date-fns';
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
};

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
  const chart = useRef<Chart<"line", any>>();

  useEffect(() => {
    if (chart.current) {
      chart.current.destroy();
    }

    chart.current = new Chart<"line">(canvasRef.current!, {
      type: "line",
      plugins: onSelect ? [RangeSelectPlugin] : [],
      options: {
        legend: undefined,
        maintainAspectRatio: false,
        plugins: {
          //@ts-ignore
          rangeSelect: {
            onSelect,
          },
          tooltips: {
            callbacks: {
              title: (tooltipItems: any[], data: any) =>
                tooltipItems.map((tooltipItem) => {
                  const date = (data?.datasets?.[tooltipItem.datasetIndex!!]
                    .data?.[tooltipItem.index!!]).x as Date;
                  return moment(date).format("ddd Do MMM");
                }),
            },
          },
          crosshair: {
            zoom: {
              enabled: onSelect != null,
            },
            line: {
              color: onSelect ? "red" : "rgba(0, 0, 0, 0)",
            },
            callbacks: {
              beforeZoom: (start: Moment, end: Moment) => {
                onSelect && onSelect(start, end);
                return false;
              },
            },
          },
        },
      },
    });
  }, [onSelect]);

  useEffect(() => {
    if (chart.current && data) {
      const gradient = canvasRef.current
        ?.getContext("2d")
        ?.createLinearGradient(0, 0, 0, 400);

      gradient!.addColorStop(0, "rgba(56,161,105, 0.2)");
      gradient!.addColorStop(1, "rgba(255,255,255, 0.0)");

      chart.current.options.scales = {};

      chart.current.options.scales!.xAxis = {
        type: "time",
        time: {
          unit: timePeriodToTimeUnit(timePeriod),
          stepSize: timePeriodToStepSize(timePeriod),
        },
        stacked: true,
        offset: true,
        grid: {
          display: false,
        },
      } as ScaleOptions<"time">;

      const yAxes: string[] = _.chain(data)
        .map((ds) => ds.yAxisID)
        .uniq()
        .value();

      yAxes.forEach(
        (axis, index) =>
          (chart.current!.options.scales![axis] = {
            type: "linear",
            id: axis,
            position: index === 0 ? "left" : "right",
            ticks: {
              precision: 0,
              callback: (value) => {
                return numeral(value).format(NICE_NUMBER_FORMAT);
              },
            },
            grid: {
              display: index === 0,
            },
          } as ScaleOptions<"linear">)
      );

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
  }, [data, chart, timePeriod]);

  return <canvas ref={canvasRef} />;
};

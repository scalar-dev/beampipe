import { useRef, useEffect } from "react";
import Chart, { ChartYAxe, ChartPoint } from "chart.js";
import { TimePeriod } from "./TimePicker";
import moment from "moment";

export const timePeriodToBucket = (timePeriod: TimePeriod) => {
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

export const timePeriodToFineBucket = (timePeriod: TimePeriod) => {
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
}: {
  data: any[];
  timePeriod: TimePeriod;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chart = useRef<Chart>();

  useEffect(() => {
    chart.current = new Chart(canvasRef.current!, {
      type: "line",
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
              unit: timePeriodToBucket(timePeriod),
            },
            gridLines: {
              display: false,
            },
          },
        ],
        yAxes: [
          {
            type: "linear",
            id: "0",
            position: "left",
            ticks: {
              precision: 0,
            },
          } as ChartYAxe,
        ],
      };

      if (data.length > 1) {
        chart.current.options.scales?.yAxes?.push({
          type: "linear",
          id: "1",
          position: "right",
          ticks: {
            precision: 0,
          },
          gridLines: {
            display: false,
          },
        } as ChartYAxe);
      }

      chart.current.data.datasets = data.map((dataset, index) => ({
        label: dataset.label,
        lineTension: 0,
        backgroundColor: dataset.backgroundColor || gradient,
        borderColor: dataset.borderColor,
        pointRadius: 5,
        pointBorderColor: "rgba(0, 0, 0, 0)",
        pointBackgroundColor: "rgba(0, 0, 0, 0)",
        type: dataset.type,
        yAxisID: `${index}`,
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

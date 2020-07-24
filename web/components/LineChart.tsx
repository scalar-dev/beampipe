import { useRef, useEffect } from "react";
import Chart from "chart.js";

export const timePeriodToBucket = (timePeriod: string) => {
  if (timePeriod === "day") return "hour";
  else if (timePeriod === "hour") return "minute";
  else if (timePeriod === "week") return "day";
  else if (timePeriod === "month") return "week";
  else return "day";
};

export const LineChart = ({
  data,
  timePeriod,
}: {
  data: any;
  timePeriod: string;
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
      },
    });
  }, []);

  useEffect(() => {
    if (chart.current && data) {
      const gradient = canvasRef.current
        ?.getContext("2d")
        ?.createLinearGradient(0, 0, 0, 400);

      gradient!.addColorStop(0, "rgba(11, 163, 96, 255)");
      gradient!.addColorStop(1, "rgba(255,255,255,0)");

      chart.current.options.scales = {
        xAxes: [
          {
            type: "time",
            time: {
              unit: timePeriodToBucket(timePeriod),
            },
          },
        ],
      };

      chart.current.data.datasets = [
        {
          lineTension: 0,
          backgroundColor: gradient,
          borderColor: "#0ba360",
          pointRadius: 0,
          data: data.map(
            ({ time, count }: { time: string; count: number }) => ({
              x: new Date(parseInt(time) * 1000.0),
              y: count,
            })
          ),
        },
      ];
      chart.current.update();
    }
  }, [data, chart]);

  return <canvas ref={canvasRef} />;
};

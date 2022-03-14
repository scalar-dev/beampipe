import { Chart, Plugin } from "chart.js";
import moment from "moment";

type RangeSelectState = {
  enabled: boolean;
  x: number | null;
  drag: {
    startX: number | null;
    endX: number | null;
  } | null;
};

type ChartWithRangeSelect = Chart & { rangeSelect: RangeSelectState };

const isEnabled = (chart: Chart) => {
  if (
    Object.keys(chart.scales).filter((k) => chart.scales[k].axis === "x")
      .length === 0
  ) {
    return false;
  }

  return true;
};

const getXScale = (chart: Chart) =>
  chart.data.datasets?.length
    ? (chart as any).scales[chart.getDatasetMeta(0).xAxisID as any]
    : null;

const getYScale = (chart: Chart) =>
  chart.data.datasets?.length
    ? (chart as any).scales[chart.getDatasetMeta(0).yAxisID as any]
    : null;

const drawSelection = (chart: any, strokeStyle: string, fillStyle: string) => {
  var yScale = getYScale(chart);

  chart.ctx.beginPath();
  chart.ctx.rect(
    chart.rangeSelect.drag.startX,
    yScale.getPixelForValue(yScale.max),
    chart.rangeSelect.x - chart.rangeSelect.drag.startX,
    yScale.getPixelForValue(yScale.min) - yScale.getPixelForValue(yScale.max)
  );
  chart.ctx.lineWidth = 1;
  chart.ctx.strokeStyle = strokeStyle;
  chart.ctx.fillStyle = fillStyle;
  chart.ctx.fill();
  chart.ctx.fillStyle = "";
  chart.ctx.stroke();
  chart.ctx.closePath();
};

export const RangeSelectPlugin: Plugin<"line"> = {
  id: "range-select",
  afterInit: (chart) => {
    (chart as any).rangeSelect = {
      enabled: false,
      x: null,
      drag: null,
    } as RangeSelectState;
  },

  afterEvent: (chart: ChartWithRangeSelect, { event }) => {
    if (!isEnabled(chart)) {
      return;
    }

    const xScale = getXScale(chart);

    if (!xScale) {
      return;
    }

    chart.rangeSelect.enabled = event.type !== "mouseout";

    if (!chart.rangeSelect.enabled) {
      chart.update();
      return true;
    }

    let buttons =
      (event.native as MouseEvent)?.buttons === undefined
        ? (event.native as MouseEvent).which
        : (event.native as MouseEvent).buttons;

    if ((event.native as MouseEvent).type === "mouseup") {
      buttons = 0;
    }

    if (buttons === 1 && !chart.rangeSelect.drag) {
      chart.rangeSelect.drag = { startX: event.x, endX: null };
    }

    // handle drag to zoom
    if (chart.rangeSelect.drag?.startX && buttons === 0) {
      var start = moment(xScale.getValueForPixel(chart.rangeSelect.drag.startX));
      var end = moment(xScale.getValueForPixel(chart.rangeSelect.x));

      if (Math.abs(chart.rangeSelect.drag.startX - chart.rangeSelect.x!) > 1) {
        const onSelect = (chart.options?.plugins as any)?.["rangeSelect"]
          ?.onSelect;

        if (onSelect) {
          if (end < start) {
            onSelect(end, start);
          } else {
            onSelect(start, end);
          }
        }
      }

      chart.rangeSelect.drag = null;

      chart.update();
    }

    chart.rangeSelect.x = event.x;
    chart.draw();
  },

  afterDraw: (chart: any) => {
    if (!isEnabled(chart)) {
      return;
    }

    if (!chart.rangeSelect?.enabled) {
      return;
    }

    if (chart.rangeSelect.drag) {
      drawSelection(
        chart,
        chart.options?.plugins?.["rangeSelect"]?.strokeStyle ||
          "rgba(128, 90, 213, 0.7)",
        chart.options?.plugins?.["rangeSelect"]?.fillStyle ||
          "rgba(128, 90, 213, 0.3)"
      );
    }

    return true;
  },
};

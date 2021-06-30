import { PluginServiceRegistrationOptions } from "chart.js";

type RangeSelectState = {
  enabled: boolean;
  x: number | null;
  dragRange: {
    startX: number | null;
    endX: number | null;
  } | null;
};

const isEnabled = (chart: Chart) => {
  if (chart.config.options?.scales?.xAxes?.length === 0) {
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

export const RangeSelectPlugin: PluginServiceRegistrationOptions = {
  afterInit: (chart) => {
    if (!isEnabled(chart)) {
      return false;
    }

    (chart as any).rangeSelect = {
      enabled: false,
      x: null,
      dragRange: null,
    } as RangeSelectState;
  },

  afterEvent: (chart: any, e: any) => {
    if (!isEnabled(chart)) {
      return;
    }

    const xScale = getXScale(chart);

    if (!xScale) {
      return;
    }

    chart.rangeSelect.enabled = e.type !== "mouseout";

    if (!chart.rangeSelect.enabled) {
      chart.update();
      return true;
    }

    let buttons =
      e.native.buttons === undefined ? e.native.which : e.native.buttons;

    if (e.native.type === "mouseup") {
      buttons = 0;
    }

    if (buttons === 1 && !chart.rangeSelect.drag) {
      chart.rangeSelect.drag = { startX: e.x };
    }

    // handle drag to zoom
    if (chart.rangeSelect.drag?.startX && buttons === 0) {
      var start = xScale.getValueForPixel(chart.rangeSelect.drag.startX);
      var end = xScale.getValueForPixel(chart.rangeSelect.x);

      if (Math.abs(chart.rangeSelect.drag.startX - chart.rangeSelect.x) > 1) {
        const onSelect = chart.options?.plugins?.["rangeSelect"]?.onSelect;

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

    chart.rangeSelect.x = e.x;
    chart.draw();
  },

  afterDraw: (chart: any) => {
    if (!chart.rangeSelect.enabled) {
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

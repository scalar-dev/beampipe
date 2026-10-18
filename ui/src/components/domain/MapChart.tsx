import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { scaleLinear } from "d3";
import _ from "lodash";
import { useRef, useState, ReactNode } from "react";
import world from "./world-110m.json";

interface MapChartProps {
  data: {
    key: string;
    display: string;
    count: number;
  }[];
  onClick: (isoCode: string) => void;
}

interface TooltipState {
  content: ReactNode;
  x: number;
  y: number;
}

const MapChart = ({ data, onClick }: MapChartProps) => {
  const maxVal = _.maxBy(data, "count")?.count;
  const colorScale = scaleLinear<string>()
    .domain([0, maxVal!!])
    .range(["#dcfce7", "#15803d"]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const positionOf = (e: React.MouseEvent) => {
    const rect = containerRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full"
      onMouseMove={(e) =>
        setTooltip((t) => (t ? { ...t, ...positionOf(e) } : t))
      }
    >
      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md bg-foreground px-3 py-1.5 text-xs text-background"
          style={{ left: tooltip.x, top: tooltip.y - 12 }}
        >
          {tooltip.content}
        </div>
      )}
      <ComposableMap className="h-full w-full">
        <ZoomableGroup>
          {data && (
            <Geographies geography={world}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const d = data.find(
                    (row) => row.key === geo.properties.ISO_A2
                  );

                  return (
                    <Geography
                      key={geo.properties.NAME}
                      geography={geo}
                      fill={d ? colorScale(d.count) : "#f1f5f9"}
                      onMouseEnter={(e) => {
                        setTooltip({
                          content: (
                            <>
                              <div className="font-semibold">
                                {geo.properties.NAME}
                              </div>
                              Unique visitors: {d?.count || 0}
                            </>
                          ),
                          ...positionOf(e),
                        });
                      }}
                      onMouseLeave={() => {
                        setTooltip(null);
                      }}
                      onClick={() => onClick(geo.properties.ISO_A2)}
                      className="cursor-pointer"
                      style={{
                        default: {
                          outline: "none",
                          stroke: "#cbd5e1",
                          strokeWidth: 0.5,
                        },
                        hover: {
                          outline: "none",
                          stroke: "#15803d",
                          strokeWidth: 1.5,
                        },
                        pressed: {
                          outline: "none",
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          )}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
};

export default MapChart;

import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import _ from "lodash";
import { useState, ReactNode } from "react";
import Tippy from "@tippyjs/react";
import React from "react";
import { followCursor } from "tippy.js";
import world from "./world-110m.json";

interface MapChartProps {
  data: {
    key: string;
    display: string;
    count: number;
  }[];
  onClick: (isoCode: string) => void;
}

const MapChart = ({ data, onClick }: MapChartProps) => {
  const maxVal = _.maxBy(data, "count")?.count;
  const colorScale = scaleLinear<string>()
    .domain([0, maxVal!!])
    .range(["#ffedea", "#ff5233"]);

  const [tooltipContent, setTooltipContent] = useState<ReactNode>(null);

  return (
    <>
      <Tippy
        followCursor
        content={tooltipContent}
        visible={tooltipContent != null}
        plugins={[followCursor]}
      >
        <div className="w-full h-full">
          <ComposableMap className="w-full h-full">
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
                          fill={d ? colorScale(d.count) : "#e2e8f0"}
                          onMouseEnter={() => {
                            setTooltipContent(
                              <>
                                <b>{geo.properties.NAME}</b>
                                <br />
                                Unique visitors: {d?.count || 0}
                              </>
                            );
                          }}
                          onMouseLeave={() => {
                            setTooltipContent(null);
                          }}
                          onClick={() => onClick(geo.properties.ISO_A2)}
                          className="cursor-pointer"
                          style={{
                            default: {
                              outline: "none",
                              opacity: 1.0,
                              stroke: "#a0aec0",
                            },
                            hover: {
                              outline: "none",
                              stroke: "#ff5233",
                              strokeWidth: 5,
                              opacity: 0.5,
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
      </Tippy>
    </>
  );
};

export default MapChart;

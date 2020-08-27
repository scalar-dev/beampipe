import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import world from "world-atlas/countries-110m.json";
import { scaleLinear } from "d3";
import _ from "lodash";
import { useState, ReactNode } from "react";
import Tippy from "@tippyjs/react";
import React from "react";
import { followCursor } from "tippy.js";

interface MapChartProps {
  data: {
    key: string;
    numericKey: number;
    count: number;
  }[];
}

const MapChart = ({ data }: MapChartProps) => {
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
        inlinePositioning
        plugins={[followCursor]}
      >
        <div className="w-full h-full">
          <ComposableMap className="w-full h-full">
            <ZoomableGroup>
              {/* <Sphere stroke="#E4E5E6" strokeWidth={0.5} /> */}
              {/* <Graticule stroke="#E4E5E6" strokeWidth={0.5} /> */}
              {data && (
                <Geographies geography={world}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const d = data.find(
                        (row) => row.numericKey?.toString() === geo.id
                      );

                      return (
                        <Geography
                          key={geo.id}
                          geography={geo}
                          fill={geo.id && d ? colorScale(d.count) : "#D6D6DA"}
                          onMouseEnter={() => {
                            setTooltipContent(
                              <>
                                <b>{geo.properties.name}</b>
                                <br />
                                Unique visitors: {d?.count || 0}
                              </>
                            );
                          }}
                          onMouseLeave={() => {
                            setTooltipContent(null);
                          }}
                          style={{
                            default: {
                              outline: "none",
                              opacity: 1.0,
                            },
                            hover: {
                              outline: "none",
                              stroke: "#ff5233",
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

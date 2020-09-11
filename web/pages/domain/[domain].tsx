import { withUrql } from "../../utils/withUrql";
import { useRouter } from "next/router";
import { useQuery } from "urql";
import { useState } from "react";
import { Layout, IfUserLoggedIn, IfAnonymous } from "../../components/layout/Layout";
import { Card, CardTitle } from "../../components/Card";
import {
  timePeriodToBucket,
  timePeriodToFineBucket,
} from "../../components/viz/LineChart";
import { Table } from "../../components/Table";
import { NonIdealState } from "../../components/NonIdealState";
import _ from "lodash";
import { AuthProvider } from "../../utils/auth";
import { Stats } from "../../components/viz/Stats";
import { DomainPicker } from "../../components/viz/DomainPicker";
import { TimePicker, TimePeriod } from "../../components/viz/TimePicker";
import { GoalsCard } from "../../components/domain/Goals";
import { DashboardCard } from "../../components/domain/DashboardCard";
import { LiveCounter } from "../../components/domain/LiveCounter";
import React from "react";
import { TimeChart } from "../../components/domain/TimeChart";
import MapChart from "../../components/domain/MapChart";
import { Pills, Pill } from "../../components/Pills";
import { StatsQuery } from "../../components/domain/StatsQuery";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { TakeBackControl, Footer } from "..";

const sourceDrilldownText = (referrer: ReferrerDrilldown) => {
  if (referrer.isDirect) {
    return "source: Direct/None";
  } else if (referrer.source) {
    return `source: ${referrer.source}`;
  } else {
    return `referrer: ${referrer.referrer}`;
  }
};

const DrilldownPill: React.FunctionComponent<{ onClick: () => void }> = ({
  onClick,
  children,
}) => (
  <button
    className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-1 px-2 rounded-full mr-2"
    onClick={onClick}
  >
    {children}
    <FontAwesomeIcon className="fill-current w-4 h-4 ml-2" icon={faTimes} />
  </button>
);

const TopBar = ({
  domain,
  stats,
  drilldown,
  setDrilldown,
}: {
  domain: string;
  stats: any;
  drilldown: DrilldownState;
  setDrilldown: React.Dispatch<React.SetStateAction<DrilldownState>>;
}) => {
  return (
    <Card classNames="w-full">
      <div className="flex flex-row flex-wrap flex-1">
        <div className="text-3xl text-purple-600 font-black leading-tight flex-1 my-auto py-2">
          {domain}
          <div>
            {drilldown.referrer && (
              <DrilldownPill
                onClick={() =>
                  setDrilldown((prevState) => ({
                    ...prevState,
                    referrer: undefined,
                  }))
                }
              >
                {sourceDrilldownText(drilldown.referrer)}
              </DrilldownPill>
            )}

            {drilldown.page && (
              <DrilldownPill
                onClick={() =>
                  setDrilldown((prevState) => ({
                    ...prevState,
                    page: undefined,
                  }))
                }
              >
                page: {drilldown.page.path}
              </DrilldownPill>
            )}

            {drilldown.country && (
              <DrilldownPill
                onClick={() =>
                  setDrilldown((prevState) => ({
                    ...prevState,
                    country: undefined,
                  }))
                }
              >
                country: {drilldown.country.isoCode}
              </DrilldownPill>
            )}
          </div>
        </div>
        <div className="flex flex-row flex-1 md:flex-none">
          <LiveCounter domain={domain} />
          <Stats stats={stats.data?.events} />
        </div>
      </div>
    </Card>
  );
};

const Toolbar = ({
  timePeriod,
  setTimePeriod,
}: {
  timePeriod: TimePeriod;
  setTimePeriod: (timePeriod: TimePeriod) => void;
}) => (
  <div className="py-2">
    <div className="flex flex-row max-w-full">
      <div className="flex-1">
        <IfUserLoggedIn>
          <DomainPicker />
        </IfUserLoggedIn>
      </div>
      <div>
        <TimePicker timePeriod={timePeriod} setTimePeriod={setTimePeriod} />
      </div>
    </div>
  </div>
);

type DevicesTab = "Screen Size" | "Device" | "Class";

const DevicesCard = ({ stats, drilldownStats }: { stats: any, drilldownStats: any | null }) => {
  const tabs: DevicesTab[] = ["Screen Size", "Device", "Class"];
  const [selected, setSelected] = useState<DevicesTab>(tabs[0]);

  const data = {
    "Screen Size": stats.data?.events.topScreenSizes,
    Device: stats.data?.events.topDevices,
    Class: stats.data?.events.topDeviceClasses,
  };

 const drillDownData = {
    "Screen Size": drilldownStats?.data?.events.topScreenSizes,
    Device: drilldownStats?.data?.events.topDevices,
    Class: drilldownStats?.data?.events.topDeviceClasses,
  };

  return (
    <DashboardCard position="right">
      <CardTitle>
        <div className="flex flex-wrap">
          <div className="flex-1">Devices</div>
          <Pills>
            {tabs.map((tab) => (
              <Pill
                key={tab}
                onClick={(e) => {
                  setSelected(tab);
                  e.preventDefault();
                }}
                selected={selected === tab}
              >
                {tab}
              </Pill>
            ))}
          </Pills>
        </div>
      </CardTitle>
      <NonIdealState
        isLoading={stats.fetching || drilldownStats?.fetching}
        isIdeal={stats.data?.events.topScreenSizes.length > 0}
      >
        <Table
          columnHeadings={[selected, "Visits"]}
          data={data[selected]}
          drilldownData={drillDownData[selected]}
        />
      </NonIdealState>
    </DashboardCard>
  );
};

const MapCard = ({
  stats,
  drilldownStats,
  setDrilldown,
}: {
  stats: any;
  drilldownStats: any | null;
  setDrilldown: React.Dispatch<React.SetStateAction<DrilldownState>>;
}) => {
  const [selected, setSelected] = useState<"table" | "map">("map");

  return (
    <DashboardCard position="left">
      <CardTitle>
        <div className="flex flex-wrap">
          <div className="flex-1">Countries</div>
          <Pills>
            <Pill
              onClick={(e) => {
                setSelected("map");
                e.preventDefault();
              }}
              selected={selected === "map"}
            >
              Map
            </Pill>
            <Pill
              onClick={(e) => {
                setSelected("table");
                e.preventDefault();
              }}
              selected={selected === "table"}
            >
              Table
            </Pill>
          </Pills>
        </div>
      </CardTitle>
      <NonIdealState
        isLoading={stats.fetching || drilldownStats?.fetching}
        isIdeal={stats.data?.events.topCountries.length > 0}
      >
        {selected === "table" ? (
          <Table
            columnHeadings={["Country", "Visits"]}
            data={stats.data?.events.topCountries}
            drilldownData={drilldownStats?.data?.events.topCountries}
          />
        ) : (
          <MapChart
            data={stats.data?.events.topCountries.map((country: any) => ({
              key: country.key,
              count: country.count,
              isoCode: country.data.iso_country_code,
            }))}
            onClick={(isoCode) =>
              setDrilldown((prevState) => ({
                ...prevState,
                country: { isoCode },
              }))
            }
          />
        )}
      </NonIdealState>
    </DashboardCard>
  );
};

interface ReferrerDrilldown {
  isDirect: boolean;
  source: string | null;
  referrer: string | null;
}

interface PageDrilldown {
  path: string;
}

interface CountryDrilldown {
  isoCode: string;
}

interface DrilldownState {
  referrer?: ReferrerDrilldown;
  page?: PageDrilldown;
  country?: CountryDrilldown;
}

const Root: React.FunctionComponent<{ domain: string }> = ({ domain }) => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>({ type: "month" });
  const [drilldown, setDrilldown] = useState<DrilldownState>({});

  const [stats, refetchStats] = useQuery({
    query: StatsQuery,
    variables: {
      domain,
      bucketDuration: timePeriodToBucket(timePeriod),
      uniqueBucketDuration: timePeriodToFineBucket(timePeriod),
      timePeriod: {
        type: timePeriod.type,
        startTime: timePeriod.startTime && timePeriod.startTime?.toISOString(),
        endTime: timePeriod.endTime && timePeriod.endTime?.toISOString(),
      },
    },
  });

  const isDrilldown: boolean = _.some([
    drilldown.page,
    drilldown.referrer,
    drilldown.country,
  ]);

  const [drilldownStats, refetchDrilldownStats] = useQuery({
    query: StatsQuery,
    variables: {
      domain,
      bucketDuration: timePeriodToBucket(timePeriod),
      uniqueBucketDuration: timePeriodToFineBucket(timePeriod),
      timePeriod: {
        type: timePeriod.type,
        startTime: timePeriod.startTime && timePeriod.startTime?.toISOString(),
        endTime: timePeriod.endTime && timePeriod.endTime?.toISOString(),
      },
      ...drilldown,
    },
    pause: !isDrilldown,
  });

  return (
    <div className="container mx-auto flex flex-col">
      <Toolbar timePeriod={timePeriod} setTimePeriod={setTimePeriod} />
      <div className="flex flex-row flex-wrap">
        <TopBar
          stats={stats}
          domain={domain}
          drilldown={drilldown}
          setDrilldown={setDrilldown}
        />
        <TimeChart
          stats={stats}
          showDrilldown={isDrilldown}
          drilldownStats={drilldownStats}
          timePeriod={timePeriod}
        />

        <DashboardCard position="left">
          <CardTitle>Pages</CardTitle>
          <NonIdealState
            isLoading={stats.fetching}
            isIdeal={stats.data?.events.topPages.length > 0}
          >
            <Table
              data={stats.data?.events.topPages}
              drilldownData={
                isDrilldown ? drilldownStats.data?.events.topPages : null
              }
              columnHeadings={["Page", "Visits"]}
              onClick={(path) =>
                setDrilldown((prevState) => ({
                  ...prevState,
                  page: { path: path! },
                }))
              }
            />
          </NonIdealState>
        </DashboardCard>

        <DashboardCard position="right">
          <CardTitle>Sources</CardTitle>
          <div className="flex flex-1 max-w-full">
            <NonIdealState
              isLoading={stats.fetching || drilldownStats.fetching}
              isIdeal={stats.data?.events.topSources.length > 0}
            >
              <Table
                showImages
                columnHeadings={["Source", "Visits"]}
                drilldownData={
                  isDrilldown
                    ? drilldownStats.data?.events.topSources.map(
                        (source: any) => ({
                          key: `${source.source}_${source.referrer}`,
                          count: source.count,
                        })
                      )
                    : null
                }
                data={stats.data?.events.topSources.map((source: any) => ({
                  key: `${source.source}_${source.referrer}`,
                  label: source.source || source.referrer || "none",
                  count: source.count,
                  image: source.referrer && (
                    <img
                      className="inline h-4 w-4"
                      src={`https://icons.duckduckgo.com/ip3/${source.referrer}.ico`}
                    />
                  ),
                  onClick: () =>
                    setDrilldown((prevState) => ({
                      ...prevState,
                      referrer: {
                        source: source.source,
                        referrer: source.referrer,
                        isDirect:
                          source.source == null && source.referrer == null,
                      },
                    })),
                }))}
              />
            </NonIdealState>
          </div>
        </DashboardCard>

        <MapCard
          stats={stats}
          setDrilldown={setDrilldown}
          drilldownStats={isDrilldown ? drilldownStats : null}
        />
        <DevicesCard
          stats={stats}
          drilldownStats={isDrilldown ? drilldownStats : null}
        />

        <DashboardCard position="left">
          <CardTitle>Operating Systems</CardTitle>
          <NonIdealState
            isLoading={stats.fetching || drilldownStats.fetching}
            isIdeal={stats.data?.events.topOperatingSystems.length > 0}
          >
            <Table
              columnHeadings={["OS", "Visits"]}
              data={stats.data?.events.topOperatingSystems}
              drilldownData={
                isDrilldown
                  ? drilldownStats.data?.events.topOperatingSystems
                  : null
              }
            />
          </NonIdealState>
        </DashboardCard>

        <DashboardCard position="right">
          <CardTitle>User Agents</CardTitle>
          <NonIdealState
            isLoading={stats.fetching || drilldownStats.fetching}
            isIdeal={stats.data?.events.topAgents.length > 0}
          >
            <Table
              columnHeadings={["User Agent", "Visits"]}
              data={stats.data?.events.topAgents}
              drilldownData={
                isDrilldown ? drilldownStats.data?.events.topAgents : null
              }
            />
          </NonIdealState>
        </DashboardCard>

        <GoalsCard
          domain={domain}
          stats={stats}
          refetch={() => {
            refetchStats({ requestPolicy: "network-only" });
            refetchDrilldownStats({ requestPolicy: "network-only" });
          }}
        />
      </div>
      <IfAnonymous>
        <div className="pb-8">
          <TakeBackControl />
        </div>
      </IfAnonymous>
    </div>
  );
};

const DomainPage = () => {
  const router = useRouter();

  return (
    <AuthProvider>
      <Layout title={router.query.domain as string}>
        <Root domain={router.query.domain as string} />

        <IfAnonymous>
          <Footer />
        </IfAnonymous>
      </Layout>
    </AuthProvider>
  );
};

export default withUrql(DomainPage);

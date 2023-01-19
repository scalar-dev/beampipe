import { useQuery } from "urql";
import { useState } from "react";
import {
  Layout,
  IfUserLoggedIn,
  IfAnonymous,
} from "../components/layout/Layout";
import { Card, CardTitle } from "../components/Card";
import { timePeriodToBucketDuration } from "../components/viz/LineChart";
import { Table } from "../components/Table";
import { NonIdealState } from "../components/NonIdealState";
import _ from "lodash";
import { AuthProvider } from "../utils/auth";
import { Stats } from "../components/viz/Stats";
import { DomainPicker } from "../components/viz/DomainPicker";
import { TimePicker, TimePeriod } from "../components/viz/TimePicker";
import { GoalsCard } from "../components/domain/Goals";
import { DashboardCard } from "../components/domain/DashboardCard";
import { LiveCounter } from "../components/domain/LiveCounter";
import React from "react";
import { TimeChart } from "../components/domain/TimeChart";
import MapChart from "../components/domain/MapChart";
import { Pills, Pill } from "../components/Pills";
import { StatsQuery } from "../components/domain/StatsQuery";
import { Link, useParams } from "react-router-dom";
import { DrilldownPills, DrilldownState } from "../components/domain/Drilldown";
import {
  faBook,
  faClipboardCheck,
  faAt,
} from "@fortawesome/free-solid-svg-icons";
import {
  faGithub,
  faTwitter,
  faProductHunt,
  faMedium,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const Footer = () => (
  <footer className="bg-green-600 text-white pt-8">
    <div className="container mx-auto  px-8">
      <div className="w-full flex flex-col md:flex-row pt-6">
        <div className="flex-1 mb-6">
          <a
            className="no-underline hover:no-underline font-bold text-2xl lg:text-4xl"
            href="https://beampipe.io"
          >
            beampipe
          </a>
        </div>

        <div className="flex-1">
          <p className="uppercase font-extrabold md:mb-6">Links</p>
          <ul className="list-reset mb-6">
            <li className="mt-2 inline-block mr-2 md:block md:mr-0">
              <a
                href="https://docs.beampipe.io/"
                target="_blank"
                rel="noreferrer"
                className="no-underline hover:underline"
              >
                <FontAwesomeIcon
                  className="fill-current w-4 h-4 mr-2"
                  icon={faBook}
                />
                Docs
              </a>
            </li>
            <li className="mt-2 inline-block mr-2 md:block md:mr-0">
              <Link
                to="/privacy"
                target="_blank"
                className="no-underline hover:underline"
              >
                <FontAwesomeIcon
                  className="fill-current w-4 h-4 mr-2"
                  icon={faClipboardCheck}
                />
                Privacy policy
              </Link>
            </li>
            <li className="mt-2 inline-block mr-2 md:block md:mr-0">
              <a
                href="mailto:hello@beampipe.io"
                className="no-underline hover:underline"
              >
                <FontAwesomeIcon
                  className="fill-current w-4 h-4 mr-2"
                  icon={faAt}
                />
                Contact us
              </a>
            </li>
          </ul>
        </div>

        <div className="flex-1">
          <p className="uppercase font-extrabold md:mb-6">Social</p>
          <ul className="list-reset mb-6">
            <li className="mt-2 inline-block mr-2 md:block md:mr-0">
              <a
                href="https://twitter.com/beampipe_io"
                target="_blank"
                rel="noreferrer"
                className="no-underline hover:underline"
              >
                <FontAwesomeIcon
                  className="fill-current w-4 h-4 mr-2"
                  icon={faTwitter}
                />
                Twitter
              </a>
            </li>

            <li className="mt-2 inline-block mr-2 md:block md:mr-0">
              <a
                href="https://medium.com/beampipe"
                target="_blank"
                rel="noreferrer"
                className="no-underline hover:underline"
              >
                <FontAwesomeIcon
                  className="fill-current w-4 h-4 mr-2"
                  icon={faMedium}
                />
                Medium
              </a>
            </li>
            <li className="mt-2 inline-block mr-2 md:block md:mr-0">
              <a
                href="https://www.producthunt.com/posts/beampipe"
                target="_blank"
                rel="noreferrer"
                className="no-underline hover:underline"
              >
                <FontAwesomeIcon
                  className="fill-current w-4 h-4 mr-2"
                  icon={faProductHunt}
                />
                Product Hunt
              </a>
            </li>
            <li className="mt-2 inline-block mr-2 md:block md:mr-0">
              <a
                href="https://github.com/scalar-dev/beampipe"
                target="_blank"
                rel="noreferrer"
                className="no-underline hover:underline"
              >
                <FontAwesomeIcon
                  className="fill-current w-4 h-4 mr-2"
                  icon={faGithub}
                />
                Github
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="pb-6 text-center w-full text-sm">
        Copyright © Beampipe 2020.
      </div>
    </div>
  </footer>
);

export const TakeBackControl = () => (
  <div className="mx-auto container py-8 text-center">
    <div className="font-black leading-tight text-5xl md:text-6xl text-gray-800">
      Take back control of your analytics.
    </div>
    <div className="pt-8">
      <Link
        to="/sign-up"
        className="rounded-lg p-4 hover:bg-purple-500 bg-purple-600 text-white text-xl md:text-2xl font-semibold leading-tight shadow-md mr-2 md:mr-4"
      >
        Get started.
      </Link>
    </div>
  </div>
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
            <DrilldownPills drilldown={drilldown} setDrilldown={setDrilldown} />
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
    <div className="flex flex-row max-w-full items-center">
      <div className="flex-1">
        <IfUserLoggedIn>
          <DomainPicker />
        </IfUserLoggedIn>
        <IfAnonymous>
          <div className="align-middle">
            <Link
              to="/sign-up"
              className="hover:text-purple-600 text-gray-600 text-lg font-bold leading-tight"
            >
              Get beampipe for your site.
            </Link>
          </div>
        </IfAnonymous>
      </div>
      <div>
        <TimePicker timePeriod={timePeriod} setTimePeriod={setTimePeriod} />
      </div>
    </div>
  </div>
);

type DevicesTab = "Screen Size" | "Device" | "Class";

const DevicesCard = ({
  stats,
  setDrilldown,
  drilldownStats,
}: {
  stats: any;
  setDrilldown: React.Dispatch<React.SetStateAction<DrilldownState>>;
  drilldownStats: any | null;
}) => {
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

  const setDrilldownFunctions = {
    "Screen Size": (key: string | null) =>
      setDrilldown((prevState) => ({
        ...prevState,
        device: {
          device: key,
        },
      })),
    Device: (key: string | null) =>
      setDrilldown((prevState) => ({
        ...prevState,
        deviceName: {
          deviceName: key,
        },
      })),
    Class: (key: string | null) =>
      setDrilldown((prevState) => ({
        ...prevState,
        deviceClass: {
          deviceClass: key,
        },
      })),
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
          onClick={setDrilldownFunctions[selected]}
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
            onClick={(isoCode) =>
              setDrilldown((prevState) => ({
                ...prevState,
                country: { isoCode },
              }))
            }
            drilldownData={drilldownStats?.data?.events.topCountries}
          />
        ) : (
          <MapChart
            data={stats.data?.events.topCountries}
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

const Root: React.FunctionComponent<{ domain: string }> = ({ domain }) => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>({ type: "month" });
  const [drilldown, setDrilldown] = useState<DrilldownState>({});

  const [stats, refetchStats] = useQuery({
    query: StatsQuery,
    variables: {
      domain,
      bucketDuration: timePeriodToBucketDuration(timePeriod),
      uniqueBucketDuration: timePeriodToBucketDuration(timePeriod),
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
    drilldown.time,
    drilldown.device,
    drilldown.deviceName,
    drilldown.deviceClass,
    drilldown.operatingSystem,
    drilldown.userAgent,
  ]);

  const [drilldownStats, refetchDrilldownStats] = useQuery({
    query: StatsQuery,
    variables: {
      domain,
      bucketDuration: timePeriodToBucketDuration(timePeriod),
      uniqueBucketDuration: timePeriodToBucketDuration(timePeriod),
      timePeriod: {
        type: timePeriod.type,
        startTime: timePeriod.startTime && timePeriod.startTime?.toISOString(),
        endTime: timePeriod.endTime && timePeriod.endTime?.toISOString(),
      },
      drilldowns: {
        ...drilldown,
        time: drilldown.time
          ? {
              start: drilldown.time.start.toISOString(),
              end: drilldown.time.end.toISOString(),
            }
          : null,
      },
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
          onSelect={(start, end) => {
            setDrilldown((prevState) => ({
              ...prevState,
              time: {
                start,
                end,
              },
            }));
          }}
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
                    alt={source.referrer}
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
        </DashboardCard>

        <MapCard
          stats={stats}
          setDrilldown={setDrilldown}
          drilldownStats={isDrilldown ? drilldownStats : null}
        />
        <DevicesCard
          stats={stats}
          setDrilldown={setDrilldown}
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
              onClick={(key) =>
                setDrilldown((prevState) => ({
                  ...prevState,
                  operatingSystem: {
                    operatingSystem: key,
                  },
                }))
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
              onClick={(key) =>
                setDrilldown((prevState) => ({
                  ...prevState,
                  userAgent: {
                    userAgent: key,
                  },
                }))
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
  const params = useParams();

  return (
    <AuthProvider>
      <Layout title={params.domain as string}>
        <Root domain={params.domain as string} />

        <IfAnonymous>
          <Footer />
        </IfAnonymous>
      </Layout>
    </AuthProvider>
  );
};

export default DomainPage;

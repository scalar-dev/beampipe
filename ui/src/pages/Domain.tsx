import { useQuery } from "urql";
import { useState } from "react";
import {
  Layout,
  IfUserLoggedIn,
  IfAnonymous,
} from "../components/layout/Layout";
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
import { StatsQuery } from "../components/domain/StatsQuery";
import { Link, useParams } from "react-router-dom";
import { DrilldownPills, DrilldownState } from "../components/domain/Drilldown";
import { Logo } from "@beampipe/components";
import { SCALAR_CONTACT_URL, SCALAR_URL } from "../scalar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Footer = () => (
  <footer className="border-t bg-background">
    <div className="container mx-auto flex flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <a
          href="https://beampipe.io"
          className="text-xl font-extrabold tracking-tight text-primary hover:text-primary/80"
        >
          <Logo />
        </a>
        <p className="mt-2 text-sm text-muted-foreground">
          Built by{" "}
          <a href={SCALAR_URL} className="font-semibold text-foreground hover:text-primary">
            Scalar
          </a>
          . We build AI systems to help you scale.{" "}
          <a href={SCALAR_CONTACT_URL} className="font-semibold text-primary hover:text-primary/80">
            Work with us →
          </a>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Beampipe.
        </p>
      </div>
      <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground">
        <a href="https://docs.beampipe.io/" target="_blank" rel="noreferrer" className="hover:text-foreground">
          Docs
        </a>
        <a href="https://beampipe.io/privacy" className="hover:text-foreground">
          Privacy policy
        </a>
        <a href="mailto:hello@beampipe.io" className="hover:text-foreground">
          Contact us
        </a>
        <a href="https://github.com/scalar-dev/beampipe" target="_blank" rel="noreferrer" className="hover:text-foreground">
          GitHub
        </a>
      </nav>
    </div>
  </footer>
);

export const TakeBackControl = () => (
  <div className="rounded-2xl bg-primary px-6 py-12 text-center sm:px-16">
    <h2 className="text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl">
      Take back control of your analytics.
    </h2>
    <p className="mx-auto mt-3 max-w-xl text-primary-foreground/80">
      Simple, privacy-focussed analytics. Free for up to 10k monthly page views.
    </p>
    <Button asChild size="lg" variant="secondary" className="mt-6">
      <Link to="/sign-up">Get started</Link>
    </Button>
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
    <Card className="md:col-span-2">
      <CardContent className="flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {domain}
          </h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <DrilldownPills drilldown={drilldown} setDrilldown={setDrilldown} />
          </div>
        </div>
        <div className="flex flex-row flex-wrap gap-6 lg:flex-nowrap lg:gap-8">
          <LiveCounter domain={domain} />
          <Stats stats={stats.data?.events} />
        </div>
      </CardContent>
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
  <div className="flex flex-row flex-wrap items-center justify-between gap-3 py-6">
    <div>
      <IfUserLoggedIn>
        <DomainPicker />
      </IfUserLoggedIn>
      <IfAnonymous>
        <Link
          to="/sign-up"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Get beampipe for your site <span aria-hidden="true">→</span>
        </Link>
      </IfAnonymous>
    </div>
    <TimePicker timePeriod={timePeriod} setTimePeriod={setTimePeriod} />
  </div>
);

const CardTabs = <T extends string>({
  tabs,
  selected,
  setSelected,
}: {
  tabs: T[];
  selected: T;
  setSelected: (tab: T) => void;
}) => (
  <Tabs value={selected} onValueChange={(v) => setSelected(v as T)}>
    <TabsList className="h-8">
      {tabs.map((tab) => (
        <TabsTrigger key={tab} value={tab} className="px-2 text-xs">
          {tab}
        </TabsTrigger>
      ))}
    </TabsList>
  </Tabs>
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
    <DashboardCard
      title="Devices"
      action={
        <CardTabs tabs={tabs} selected={selected} setSelected={setSelected} />
      }
    >
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
  const [selected, setSelected] = useState<"Map" | "Table">("Map");

  return (
    <DashboardCard
      title="Countries"
      action={
        <CardTabs
          tabs={["Map", "Table"]}
          selected={selected}
          setSelected={setSelected}
        />
      }
    >
      <NonIdealState
        isLoading={stats.fetching || drilldownStats?.fetching}
        isIdeal={stats.data?.events.topCountries.length > 0}
      >
        {selected === "Table" ? (
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
    <div className="container mx-auto px-4 pb-12">
      <Toolbar timePeriod={timePeriod} setTimePeriod={setTimePeriod} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

        <DashboardCard title="Pages">
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

        <DashboardCard title="Sources">
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

        <DashboardCard title="Operating Systems">
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

        <DashboardCard title="User Agents">
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
        <div className="pt-12">
          <TakeBackControl />
        </div>
      </IfAnonymous>
      <div className="pt-8 text-center text-xs text-muted-foreground">
        IP Geolocation by{" "}
        <a
          href="https://db-ip.com"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          DB-IP
        </a>
      </div>
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

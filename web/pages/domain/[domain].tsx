import { withUrql } from "../../utils/withUrql";
import { useRouter } from "next/router";
import { useQuery } from "urql";
import gql from "graphql-tag";
import { useState } from "react";
import { Layout, IfUserLoggedIn } from "../../components/layout/Layout";
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

const TopBar = ({ domain, stats }: { domain: string; stats: any }) => (
  <Card classNames="w-full">
    <div className="flex flex-row flex-wrap flex-1">
      <div className="text-2xl text-gray-800 font-extrabold flex-1 my-auto">
        {domain}
      </div>
      <div className="flex flex-row flex-1 md:flex-none">
        <LiveCounter domain={domain} />
        <Stats stats={stats.data?.events} />
      </div>
    </div>
  </Card>
);

const query = gql`
  query stats(
    $domain: String!
    $bucketDuration: String!
    $uniqueBucketDuration: String!
    $timePeriod: TimePeriodInput!
  ) {
    events(domain: $domain, timePeriod: $timePeriod) {
      bucketed(bucketDuration: $bucketDuration) {
        time
        count
      }

      bucketedUnique(bucketDuration: $uniqueBucketDuration) {
        time
        count
      }

      topPages {
        key
        count
      }

      topSources {
        referrer
        source
        count
      }

      topScreenSizes {
        key
        count
      }

      topCountries {
        key
        count
      }

      topDevices {
        key
        count
      }

      topDeviceClasses {
        key
        count
      }

      topOperatingSystems {
        key
        count
      }

      topAgents {
        key
        count
      }

      goals {
        key
        count
      }

      countUnique
      previousCountUnique
      count
      previousCount
      bounceCount
      previousBounceCount
    }
  }
`;

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

const Pill = React.forwardRef<
  HTMLAnchorElement,
  { selected?: boolean } & React.DetailedHTMLProps<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  >
>(({ selected = false, children, ...otherProps }, ref) => (
  <li className="ml-3 flex">
    <a
      ref={ref}
      className={`transition duration-200 text-xs my-auto inline-block font-medium border-b-2 ${
        selected
          ? "text-gray-600 border-gray-400"
          : "text-gray-500 border-transparent hover:text-gray-600"
      }`}
      href="#"
      {...otherProps}
    >
      {children}
    </a>
  </li>
));

const Pills: React.FunctionComponent = ({ children }) => (
  <ul className="flex items-center">{children}</ul>
);

type DevicesTab = "Screen Size" | "Device" | "Class";

const DevicesCard = ({ stats }: { stats: any }) => {
  const tabs: DevicesTab[] = ["Screen Size", "Device", "Class"];
  const [selected, setSelected] = useState<DevicesTab>(tabs[0]);

  const data = {
    "Screen Size": stats.data?.events.topScreenSizes,
    Device: stats.data?.events.topDevices,
    Class: stats.data?.events.topDeviceClasses,
  };
  console.log(tabs);

  return (
    <DashboardCard position="right">
      <CardTitle>
        <div className="flex flex-wrap">
          <div className="flex-1">Top Devices</div>
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
        isLoading={stats.fetching}
        isIdeal={stats.data?.events.topScreenSizes.length > 0}
      >
        <Table columnHeadings={[selected, "Visits"]} data={data[selected]} />
      </NonIdealState>
    </DashboardCard>
  );
};

const Root: React.FunctionComponent<{ domain: string }> = ({ domain }) => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>({ type: "day" });

  const [stats, refetchStats] = useQuery({
    query,
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

  return (
    <div className="container mx-auto flex flex-col">
      <Toolbar timePeriod={timePeriod} setTimePeriod={setTimePeriod} />
      <div className="flex flex-row flex-wrap">
        <TopBar stats={stats} domain={domain} />
        <TimeChart stats={stats} timePeriod={timePeriod} />

        <DashboardCard position="left">
          <CardTitle>Top Pages</CardTitle>
          <NonIdealState
            isLoading={stats.fetching}
            isIdeal={stats.data?.events.topPages.length > 0}
          >
            <Table
              data={stats.data?.events.topPages}
              columnHeadings={["Page", "Visits"]}
            />
          </NonIdealState>
        </DashboardCard>

        <DashboardCard position="right">
          <CardTitle>Top Sources</CardTitle>
          <div className="flex flex-1 max-w-full">
            <NonIdealState
              isLoading={stats.fetching}
              isIdeal={stats.data?.events.topSources.length > 0}
            >
              <Table
                showImages
                columnHeadings={["Source", "Visits"]}
                data={stats.data?.events.topSources.map((source: any) => ({
                  key: source.source || source.referrer,
                  reactKey: `${source.source}_${source.referrer}`,
                  count: source.count,
                  image: source.referrer && (
                    <img
                      className="inline h-4 w-4"
                      src={`https://icons.duckduckgo.com/ip3/${source.referrer}.ico`}
                    />
                  ),
                }))}
              />
            </NonIdealState>
          </div>
        </DashboardCard>

        <DashboardCard position="left">
          <CardTitle>Top Countries</CardTitle>
          <NonIdealState
            isLoading={stats.fetching}
            isIdeal={stats.data?.events.topCountries.length > 0}
          >
            <Table
              columnHeadings={["Country", "Visits"]}
              data={stats.data?.events.topCountries}
            />
          </NonIdealState>
        </DashboardCard>

        <DevicesCard stats={stats} />

        <DashboardCard position="left">
          <CardTitle>Top Operating Systems</CardTitle>
          <NonIdealState
            isLoading={stats.fetching}
            isIdeal={stats.data?.events.topOperatingSystems.length > 0}
          >
            <Table
              columnHeadings={["OS", "Visits"]}
              data={stats.data?.events.topOperatingSystems}
            />
          </NonIdealState>
        </DashboardCard>

        <DashboardCard position="right">
          <CardTitle>Top User Agents</CardTitle>
          <NonIdealState
            isLoading={stats.fetching}
            isIdeal={stats.data?.events.topAgents.length > 0}
          >
            <Table
              columnHeadings={["User Agent", "Visits"]}
              data={stats.data?.events.topAgents}
            />
          </NonIdealState>
        </DashboardCard>

        <GoalsCard
          domain={domain}
          stats={stats}
          refetch={() => refetchStats({ requestPolicy: "network-only" })}
        />
      </div>
    </div>
  );
};

const DomainPage = () => {
  const router = useRouter();

  return (
    <AuthProvider>
      <Layout title={`beampipe | ${router.query.domain}`}>
        <Root domain={router.query.domain as string} />
      </Layout>
    </AuthProvider>
  );
};

export default withUrql(DomainPage);

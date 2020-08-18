import { withUrql } from "../../utils/withUrql";
import { useRouter } from "next/router";
import { useQuery } from "urql";
import gql from "graphql-tag";
import { useState, useContext } from "react";
import { Layout } from "../../components/Layout";
import { Card, CardTitle } from "../../components/Card";
import {
  timePeriodToBucket,
  LineChart,
  timePeriodToFineBucket,
} from "../../components/viz/LineChart";
import { Table } from "../../components/Table";
import { NonIdealState } from "../../components/NonIdealState";
import _ from "lodash";
import { AuthProvider, UserContext } from "../../utils/auth";
import { Stats, StatsCounter } from "../../components/viz/Stats";
import { Spinner } from "../../components/Spinner";
import numeral from "numeral";
import { DomainPicker } from "../../components/viz/DomainPicker";
import { TimePicker } from "../../components/viz/TimePicker";

const cardHeight = "27rem";

const TopBar = ({
  domain,
  stats,
  liveStats,
}: {
  domain: string;
  stats: any;
  liveStats: any;
}) => (
  <Card classNames="w-full">
    <div className="flex flex-row flex-wrap flex-1">
      <div className="text-2xl text-gray-800 font-extrabold flex-1 my-auto">
        {domain}
      </div>
      <div className="flex flex-row flex-1 md:flex-none">
        <StatsCounter
          value={
            liveStats.data ? (
              <div className="animate-pulse">
                {numeral(liveStats.data.liveUnique).format("0.[0]a")}
              </div>
            ) : (
              <Spinner />
            )
          }
          title="Online now"
          delta={null}
        />
        <Stats stats={stats.data?.events} />
      </div>
    </div>
  </Card>
);

const Chart = ({ stats, timePeriod }: { stats: any; timePeriod: string }) => (
  <Card classNames="w-full" style={{ height: "22rem" }}>
    <NonIdealState
      isLoading={stats.fetching}
      isIdeal={!_.every(stats.data?.events?.bucketed, (x) => x.count === 0)}
    >
      <LineChart
        data={[
          {
            data: stats.data?.events?.bucketed,
            type: "line",
            label: "Page views",
          },
          {
            data: stats.data?.events?.bucketedUnique,
            type: "bar",
            backgroundColor: "rgba(203, 213, 224, 0.5)",
            label: "Unique visitors",
          },
        ]}
        timePeriod={timePeriod}
      />
    </NonIdealState>
  </Card>
);

const query = gql`
      query stats(
        $domain: String!
        $bucketDuration: String!
        $uniqueBucketDuration: String!
        $timePeriodStart: String!
      ) {
        events(domain: $domain, timePeriodStart: $timePeriodStart) {
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

          countUnique
          previousCountUnique
          count
          previousCount
          bounceCount
          previousBounceCount
        }
      }
    `;

const Root: React.FunctionComponent<{ domain: string }> = ({ domain }) => {
  const [timePeriod, setTimePeriod] = useState("day");

  const [stats] = useQuery({
    query,
    variables: {
      domain,
      bucketDuration: timePeriodToBucket(timePeriod),
      uniqueBucketDuration: timePeriodToFineBucket(timePeriod),
      timePeriodStart: timePeriod,
    },
  });

  const [liveStats] = useQuery({
    query: gql`
      query stats($domain: String!) {
        liveUnique(domain: $domain)
      }
    `,
    pollInterval: 5000,
    variables: {
      domain,
    },
  });

  const user = useContext(UserContext);

  return (
    <div className="container mx-auto flex flex-col">
      <div className="py-2">
        <div className="flex flex-row max-w-full">
          <div className="flex-1">{user && <DomainPicker />}</div>
          <div>
            <TimePicker timePeriod={timePeriod} setTimePeriod={setTimePeriod} />
          </div>
        </div>
      </div>
      <div className="flex flex-row flex-wrap">
        <TopBar stats={stats} liveStats={liveStats} domain={domain} />
        <Chart stats={stats} timePeriod={timePeriod} />

        <Card
          classNames="w-full md:w-1/2 md:pr-4"
          style={{ height: cardHeight }}
        >
          <CardTitle>Top Pages</CardTitle>
          <NonIdealState
            isLoading={stats.fetching}
            isIdeal={stats.data?.events.topPages.length > 0}
          >
            <Table data={stats.data?.events.topPages} />
          </NonIdealState>
        </Card>

        <Card classNames="w-full md:w-1/2" style={{ height: cardHeight }}>
          <CardTitle>Top Sources</CardTitle>
          <div className="flex flex-1 max-w-full">
            <NonIdealState
              isLoading={stats.fetching}
              isIdeal={stats.data?.events.topSources.length > 0}
            >
              <Table
                showImages
                data={stats.data?.events.topSources.map((source: any) => ({
                  key: source.source || source.referrer,
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
        </Card>

        <Card
          classNames="w-full md:w-1/2 md:pr-4"
          style={{ height: cardHeight }}
        >
          <CardTitle>Top Countries</CardTitle>
          <NonIdealState
            isLoading={stats.fetching}
            isIdeal={stats.data?.events.topCountries.length > 0}
          >
            <Table data={stats.data?.events.topCountries} />
          </NonIdealState>
        </Card>

        <Card classNames="w-full md:w-1/2" style={{ height: cardHeight }}>
          <CardTitle>Top Screen Sizes</CardTitle>
          <NonIdealState
            isLoading={stats.fetching}
            isIdeal={stats.data?.events.topScreenSizes.length > 0}
          >
            <Table data={stats.data?.events.topScreenSizes} />
          </NonIdealState>
        </Card>

        <Card
          classNames="w-full md:w-1/2 md:pr-4"
          style={{ height: cardHeight }}
        >
          <CardTitle>Top Devices</CardTitle>
          <NonIdealState
            isLoading={stats.fetching}
            isIdeal={stats.data?.events.topDevices.length > 0}
          >
            <Table data={stats.data?.events.topDevices} />
          </NonIdealState>
        </Card>

        <Card classNames="w-full md:w-1/2" style={{ height: cardHeight }}>
          <CardTitle>Top Device Classes</CardTitle>
          <div className="flex-1">
            <NonIdealState
              isLoading={stats.fetching}
              isIdeal={stats.data?.events.topDeviceClasses.length > 0}
            >
              <Table data={stats.data?.events.topDeviceClasses} />
            </NonIdealState>
          </div>
        </Card>

        <Card
          classNames="w-full md:w-1/2 md:pr-4"
          style={{ height: cardHeight }}
        >
          <CardTitle>Top Operating Systems</CardTitle>
          <NonIdealState
            isLoading={stats.fetching}
            isIdeal={stats.data?.events.topOperatingSystems.length > 0}
          >
            <Table data={stats.data?.events.topOperatingSystems} />
          </NonIdealState>
        </Card>

        <Card classNames="w-full md:w-1/2" style={{ height: cardHeight }}>
          <CardTitle>Top User Agents</CardTitle>
          <NonIdealState
            isLoading={stats.fetching}
            isIdeal={stats.data?.events.topAgents.length > 0}
          >
            <Table data={stats.data?.events.topAgents} />
          </NonIdealState>
        </Card>
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

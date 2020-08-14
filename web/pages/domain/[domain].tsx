import { withUrql } from "../../utils/withUrql";
import { useRouter } from "next/router";
import { useQuery } from "urql";
import gql from "graphql-tag";
import { useState, useContext } from "react";
import { Layout } from "../../components/Layout";
import { Card, CardTitle } from "../../components/Card";
import { timePeriodToBucket, LineChart } from "../../components/LineChart";
import { Table } from "../../components/Table";
import { NonIdealState } from "../../components/NonIdealState";
import _ from "lodash";
import { AuthProvider, UserContext } from "../../utils/auth";
import { Menu, MenuSection, MenuItem } from "../../components/Menu";
import { Tick } from "../../components/Tick";
import { Domain } from "../../interfaces";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import numeral from "numeral";
import { Spinner } from "../../components/Spinner";

const cardHeight = "27rem";

const timePeriods = ["hour", "day", "week", "month"];

const displayTimePeriod = (timePeriod: string) => {
  if (timePeriod == "hour") return "Last hour";
  else if (timePeriod == "day") return "Last 24 hours";
  else if (timePeriod == "week") return "Last 7 days";
  else if (timePeriod == "month") return "Last 28 days";
};

const DomainPicker = ({}) => {
  const router = useRouter();

  const [query] = useQuery<{ domains: Domain[] }>({
    query: gql`
      query domains {
        domains {
          id
          domain
          hasData
        }
      }
    `,
  });

  const [visible, setVisible] = useState(false);

  return (
    <Menu
      value={router.query.domain}
      visible={visible}
      setVisible={setVisible}
      align="left"
      classNames="w-40 md:w-auto"
    >
      <MenuSection>
        {query.data?.domains.map((item) => (
          <MenuItem
            key={item.domain}
            onClick={() => {
              router.push(
                "/domain/[domain]",
                `/domain/${encodeURIComponent(item.domain)}`,
                {
                  shallow: true,
                }
              );
              setVisible(false);
            }}
          >
            <div className="w-8">
              {router.query.domain === item.domain && <Tick />}
            </div>
            {item.domain}
          </MenuItem>
        ))}
      </MenuSection>
    </Menu>
  );
};

const TimePicker = ({
  timePeriod,
  setTimePeriod,
}: {
  timePeriod: string;
  setTimePeriod: (timePeriod: string) => void;
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <Menu
      value={displayTimePeriod(timePeriod)}
      visible={visible}
      setVisible={setVisible}
      align="right"
      classNames="w-40 md:w-auto"
    >
      {/* <MenuSection>
        <MenuItem>
          <div className="w-8"></div>
          Real time
        </MenuItem>
        <MenuDivider />
      </MenuSection> */}
      <MenuSection>
        {timePeriods.map((tp) => (
          <MenuItem
            key={tp}
            onClick={() => {
              setTimePeriod(tp);
              setVisible(false);
            }}
          >
            <div className="w-8">{timePeriod === tp && <Tick />}</div>
            {displayTimePeriod(tp)}
          </MenuItem>
        ))}
      </MenuSection>
    </Menu>
  );
};

const PercentageChange: React.FunctionComponent<{
  current: number;
  previous: number;
}> = ({ current, previous }) => {
  const change = previous > 0 ? (current - previous) / previous : 0;

  return (
    <div className="text-sm">
      <FontAwesomeIcon
        size="sm"
        className={`fill-current w-4 h-4 mr-2 ${
          change >= 0 ? "text-green-600" : "text-red-600"
        }`}
        icon={change >= 0 ? faArrowUp : faArrowDown}
      />
      {numeral(Math.abs(change)).format("0%")}
    </div>
  );
};

const Stats = ({ stats }: { stats?: any }) => (
  <div>
    {stats ? (
      <div className="flex flex-row">
        <div className="text-2xl mr-4">
          <span className="text-gray-500 mr-2 text-sm">total</span>
          {numeral(stats.count).format("0.[0]a")}
          <PercentageChange
            current={stats.count}
            previous={stats.previousCount}
          />
        </div>
        <div className="text-2xl">
          <span className="text-gray-500 mr-2 text-sm">unique</span>
          {numeral(stats.countUnique).format("0.[0]a")}
          <PercentageChange
            current={stats.countUnique}
            previous={stats.previousCountUnique}
          />
        </div>
      </div>
    ) : (
      <Spinner />
    )}
  </div>
);

const Root: React.FunctionComponent<{ domain: string }> = ({ domain }) => {
  const [timePeriod, setTimePeriod] = useState("day");

  const [stats] = useQuery({
    query: gql`
      query stats(
        $domain: String!
        $bucketDuration: String!
        $timePeriodStart: String!
      ) {
        events(domain: $domain, timePeriodStart: $timePeriodStart) {
          bucketed(bucketDuration: $bucketDuration) {
            time
            count
          }

          topPages {
            key
            count
          }

          topSources {
            key
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
        }
      }
    `,
    variables: {
      domain,
      bucketDuration: timePeriodToBucket(timePeriod),
      timePeriodStart: timePeriod,
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
        <Card classNames="w-full">
          <div className="flex flex-row flex-wrap">
            <div className="text-2xl font-extrabold flex-grow my-auto">
              {domain}
            </div>
            <Stats stats={stats.data?.events} />
          </div>
        </Card>
        <Card classNames="w-full" style={{ height: "22rem" }}>
          <NonIdealState
            isLoading={stats.fetching}
            isIdeal={
              !_.every(stats.data?.events?.bucketed, (x) => x.count === 0)
            }
          >
            <LineChart
              data={stats.data?.events?.bucketed}
              timePeriod={timePeriod}
            />
          </NonIdealState>
        </Card>

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
              <Table data={stats.data?.events.topSources} />
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

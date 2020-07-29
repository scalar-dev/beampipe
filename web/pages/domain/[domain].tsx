import { withUrql } from "../../utils/withUrql";
import { useRouter } from "next/router";
import { useQuery } from "urql";
import gql from "graphql-tag";
import { useState } from "react";
import { Layout } from "../../components/Layout";
import { Card, CardTitle } from "../../components/Card";
import { timePeriodToBucket, LineChart } from "../../components/LineChart";
import { Table } from "../../components/Table";
import { NonIdealState } from "../../components/NonIdealState";
import _ from "lodash";
import { AuthProvider } from "../../utils/auth";
import { Menu, MenuSection, MenuItem, MenuDivider } from "../../components/Menu";
import { Tick } from "../../components/Tick";
import { Domain } from "../../interfaces";

const cardHeight = "27rem";

const timePeriods = ["hour", "day", "week", "month"];

const displayTimePeriod = (timePeriod: string) => {
  if (timePeriod == "hour") return "Last hour";
  else if (timePeriod == "day") return "Last 24 hours";
  else if (timePeriod == "week") return "Last 7 days";
  else if (timePeriod == "month") return "Last 28 days";
}

const DomainPicker = ({ }) => {
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
}

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
      <MenuSection>
        <MenuItem>
          <div className="w-8"></div>
          Real time
        </MenuItem>
        <MenuDivider />
      </MenuSection>
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

const Root = () => {
  const router = useRouter();

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

          topReferrers {
            key
            count
          }

          topDevices {
            key
            count
          }

          topCountries {
            key
            count
          }

          countUnique
          count
        }
      }
    `,
    variables: {
      domain: router.query.domain,
      bucketDuration: timePeriodToBucket(timePeriod),
      timePeriodStart: timePeriod,
    },
  });

  return (
    <AuthProvider>
      <Layout title={`beampipe | ${router.query.domain}`}>
        <div className="container mx-auto flex flex-col">
          <div className="py-2">
            <div className="flex flex-row">
              <div className="flex-1">
                <DomainPicker />
              </div>
              <div>
                <TimePicker
                  timePeriod={timePeriod}
                  setTimePeriod={setTimePeriod}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-row flex-wrap">
            <Card classNames="w-full">
              <div className="flex flex-row flex-wrap">
                <div className="text-2xl font-extrabold flex-grow">
                  {router.query.domain}
                </div>
                <div className="text-2xl mr-4">
                  <span className="text-gray-500 mr-2 text-sm">total</span>
                  {stats.data?.events.count}
                </div>
                <div className="text-2xl">
                  <span className="text-gray-500 mr-2 text-sm">unique</span>
                  {stats.data?.events.countUnique}
                </div>
              </div>
            </Card>
            <Card classNames="w-full" style={{ height: "22rem" }}>
              <div className="flex-1">
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
              </div>
            </Card>

            <Card
              classNames="w-full md:w-1/2 md:pr-4"
              style={{ height: cardHeight }}
            >
              <CardTitle>Top Pages</CardTitle>
              <div className="flex-1">
                <NonIdealState
                  isLoading={stats.fetching}
                  isIdeal={stats.data?.events.topPages.length > 0}
                >
                  <Table data={stats.data?.events.topPages} />
                </NonIdealState>
              </div>
            </Card>

            <Card classNames="w-full md:w-1/2" style={{ height: cardHeight }}>
              <CardTitle>Top Referrers</CardTitle>
              <div className="flex-1 max-w-full">
                <NonIdealState
                  isLoading={stats.fetching}
                  isIdeal={stats.data?.events.topReferrers.length > 0}
                >
                  <Table data={stats.data?.events.topReferrers} />
                </NonIdealState>
              </div>
            </Card>

            <Card
              classNames="w-full md:w-1/2 md:pr-4"
              style={{ height: cardHeight }}
            >
              <CardTitle>Top Countries</CardTitle>
              <div className="flex-1">
                <NonIdealState
                  isLoading={stats.fetching}
                  isIdeal={stats.data?.events.topCountries.length > 0}
                >
                  <Table data={stats.data?.events.topCountries} />
                </NonIdealState>
              </div>
            </Card>

            <Card classNames="w-full md:w-1/2" style={{ height: cardHeight }}>
              <CardTitle>Top Devices</CardTitle>
              <div className="flex-1">
                <NonIdealState
                  isLoading={stats.fetching}
                  isIdeal={stats.data?.events.topDevices.length > 0}
                >
                  <Table data={stats.data?.events.topDevices} />
                </NonIdealState>
              </div>
            </Card>
          </div>
        </div>
      </Layout>
    </AuthProvider>
  );
};

export default withUrql(Root);

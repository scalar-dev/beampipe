import { withUrql } from "../../utils/withUrql";
import { useRouter } from "next/router";
import { useQuery } from "urql";
import gql from "graphql-tag";
import { useState } from "react";
import { Layout } from "../../components/Layout";
import { Card, CardTitle } from "../../components/Card";
import { timePeriodToBucket, LineChart } from "../../components/LineChart";
import { Button } from "../../components/BoldButton";

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
    <Layout title={`alysis.io | ${router.query.domain}`}>
      <div className="flex flex-row flex-wrap">
        <Card classNames="w-full">
          <div className="flex flex-row flex-wrap">
            <div className="text-2xl flex-grow">
              <span className="text-gray-500 mr-2 text-sm">domain</span>
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
          <div>
            <div className="float-right">
              <Button
                onClick={() => setTimePeriod("hour")}
                selected={timePeriod === "hour"}
              >
                Last Hour
              </Button>

              <Button
                onClick={() => setTimePeriod("day")}
                selected={timePeriod === "day"}
              >
                Today
              </Button>

              <Button
                onClick={() => setTimePeriod("week")}
                selected={timePeriod === "week"}
              >
                This week
              </Button>
            </div>
          </div>

          <div className="flex-1">
            <LineChart
              data={stats.data?.events?.bucketed}
              timePeriod={timePeriod}
            />
          </div>
        </Card>

        <Card classNames="w-full md:w-1/2 md:pr-4" style={{ height: "22rem" }}>
          <CardTitle>Top Pages</CardTitle>
          <div className="flex-1">
            <table className="w-full">
              <tbody>
                {stats.data?.events.topPages.map((page: any) => (
                  <tr key={page.key}>
                    <td className="border px-4">{page.key || "none"}</td>
                    <td className="border px-4">{page.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card classNames="w-full md:w-1/2" style={{ height: "22rem" }}>
          <CardTitle>Top Referrers</CardTitle>
          <div className="flex-1">
            <table className="w-full">
              <tbody>
                {stats.data?.events.topReferrers.map((referrer: any) => (
                  <tr key={referrer.key}>
                    <td className="border px-4">{referrer.key || "none"}</td>
                    <td className="border px-4">{referrer.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card classNames="w-full md:w-1/2 md:pr-4" style={{ height: "22rem" }}>
          <CardTitle>Top Countries</CardTitle>
          <div className="flex-1">
            <table className="w-full">
              <tbody>
                {stats.data?.events.topCountries.map((country: any) => (
                  <tr key={country.key}>
                    <td className="border px-4">{country.key || "none"}</td>
                    <td className="border px-4">{country.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card classNames="w-full md:w-1/2" style={{ height: "22rem" }}>
          <CardTitle>Top Devices</CardTitle>
          <div className="flex-1">
            <table className="w-full">
              <tbody>
                {stats.data?.events.topDevices.map((device: any) => (
                  <tr key={device.key}>
                    <td className="border px-4">{device.key || "none"}</td>
                    <td className="border px-4">{device.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default withUrql(Root);

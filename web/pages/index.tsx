import Link from "next/link";
import { Layout } from "../components/Layout";
import { withUrql } from "../utils/withUrql";
import { useQuery } from "urql";
import gql from "graphql-tag";
import { Card, CardTitle } from "../components/Card";
import { LineChart } from "../components/LineChart";

const DomainChart = ({ domain }: { domain: string }) => {
  const [query] = useQuery({
    query: gql`
      query stats($domain: String!) {
        events(domain: $domain, timePeriodStart: "week") {
          bucketed(bucketDuration: "day") {
            time
            count
          }
        }
      }
    `,
    variables: {
      domain,
    },
  });

  return (
    <>
      <LineChart data={query.data?.events?.bucketed} timePeriod="week" />
    </>
  );
};

const IndexPage = () => {
  const [query] = useQuery({
    query: gql`
      query domains {
        domains
      }
    `,
  });


  return (
    <Layout title="alysis.io | dead simple web analytics">
      <h1 className="text-2xl pb-4">Domains</h1>

      {query.data?.domains.map((domain: string) => (
        <Card key={domain} style={{ height: "15rem" }}>
          <CardTitle>
            <Link href="/domain/[domain]" as={`/domain/${domain}`}>
              <a>{domain}</a>
            </Link>
          </CardTitle>
          <div className="flex-1 h-full w-full">
            <DomainChart domain={domain} />
          </div>
        </Card>
      ))}
    </Layout>
  );
};

export default withUrql(IndexPage);

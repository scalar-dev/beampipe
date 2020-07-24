import Link from "next/link";
import { Layout } from "../components/Layout";
import { withUrql } from "../utils/withUrql";
import { useQuery, useMutation } from "urql";
import gql from "graphql-tag";
import { Card, CardTitle } from "../components/Card";
import { LineChart } from "../components/LineChart";
import { BoldButton } from "../components/BoldButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

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

const AddDomain = ({
  onCancel,
  onCreateComplete,
}: {
  onCancel: () => void;
  onCreateComplete: () => void;
}) => {
  const [domain, setDomain] = useState("");
  const [isPublic, setPublic] = useState(false);
  const [, executeMutation] = useMutation(gql`
    mutation AddDomain($domain: String!, $public: Boolean!) {
      createDomain(domain: $domain, public: $public)
    }
  `);

  return (
    <Card>
      <div className="flex-1 h-full w-full">
        <form className="w-full max-w-sm">
          <div className="md:flex md:items-center mb-6">
            <div className="md:w-1/3">
              <label
                className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
                htmlFor="domain"
              >
                Domain
              </label>
            </div>
            <div className="md:w-2/3">
              <input
                className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                id="domain"
                type="text"
                placeholder="foo.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </div>
          </div>
          <div className="md:flex md:items-center mb-6">
            <div className="md:w-1/3"></div>
            <label className="md:w-2/3 block text-gray-500 font-bold">
              <input
                className="mr-2 leading-tight"
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setPublic(e.target.checked)}
              />
              <span className="text-sm">Public</span>
            </label>
          </div>
          <div className="md:flex md:items-center">
            <div className="md:w-1/3"></div>
            <div className="md:w-2/3">
              <button
                className="mr-2 shadow bg-green-500 hover:bg-green-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
                type="button"
                onClick={async () => {
                  await executeMutation({
                    domain,
                    public: isPublic,
                  });

                  onCreateComplete();
                }}
              >
                Create
              </button>
              <button
                className="shadow bg-green-500 hover:bg-green-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
                type="button"
                onClick={onCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </Card>
  );
};

const DomainList = ({
  domains,
  refetchDomains,
}: {
  domains: any[];
  refetchDomains: () => void;
}) => {
  const [showAddDomain, setShowAddDomain] = useState(false);

  return (
    <>
      <div className="flex flex-row">
        <div className="text-2xl pb-4 flex-1">Domains</div>
        <div className="float-right">
          <BoldButton onClick={() => setShowAddDomain(true)}>
            <FontAwesomeIcon
              className="fill-current w-4 h-4 mr-2"
              icon={faPlus}
            />
            Add domain
          </BoldButton>
        </div>
      </div>

      {showAddDomain && (
        <AddDomain
          onCancel={() => setShowAddDomain(false)}
          onCreateComplete={() => {
            setShowAddDomain(false);
            refetchDomains();
          }}
        />
      )}

      {domains.map((domain: string) => (
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
    </>
  );
};

const Leader = () => (
  <>
    <div className="text-3xl font-extrabold py-8">
      dead simple web analytics
    </div>
    <div className="text-xl">
      alysis offers simple, privacy-preserving web analytics starting from £0
    </div>
  </>
);

const IndexPage = () => {
  const [query, reexecuteQuery] = useQuery({
    query: gql`
      query domains {
        domains
      }
    `,
  });

  return (
    <Layout title="alysis.io | dead simple web analytics">
      {query.data?.domains.length > 0 ? (
        <DomainList
          domains={query.data.domains}
          refetchDomains={() =>
            reexecuteQuery({ requestPolicy: "network-only" })
          }
        />
      ) : (
        <Leader />
      )}
    </Layout>
  );
};

export default withUrql(IndexPage);

import Link from "next/link";
import { Layout } from "../components/Layout";
import { withUrql } from "../utils/withUrql";
import { useQuery, useMutation } from "urql";
import gql from "graphql-tag";
import { Card, CardTitle } from "../components/Card";
import { LineChart } from "../components/LineChart";
import { BoldButton } from "../components/BoldButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCopy } from "@fortawesome/free-solid-svg-icons";
import { useState, useRef, MouseEventHandler } from "react";
import { NonIdealState } from "../components/NonIdealState";
import _ from "lodash";
import { secured } from "../utils/auth";
import { Title } from "../components/Title";
import { Domain } from "../interfaces";

const InnerDomainChart = ({ domain }: { domain: string }) => {
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
    <NonIdealState
      nonIdeal={
        <div className="text-center">
          <div className="text-xl text-gray-500 pb-4">
            No events recorded in the past week
          </div>
        </div>
      }
      isIdeal={!_.every(query.data?.events?.bucketed, (x) => x.count == 0)}
      isLoading={query.fetching}
    >
      <LineChart data={query.data?.events?.bucketed} timePeriod="week" />
    </NonIdealState>
  );
};

const DomainChart = ({ domain }: { domain: Domain }) => {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const html = `<script async defer src="https://beampipe.io/tracker.js" data-beampipe-domain="${domain.domain}">`;

  const onCopy: MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.preventDefault();
    if (ref.current) {
      const dummy = document.createElement("textarea");
      document.body.appendChild(dummy);
      dummy.value = html;
      dummy.select();
      document.execCommand("copy");
      document.body.removeChild(dummy);
    }
  };

  return (
    <NonIdealState
      nonIdeal={
        <div className="text-center">
          <div className="text-xl text-gray-500 pb-4">This domain has not recorded any data</div>
          <div>
            Add the following snippet to your page to start collecting data.
            <div className="pt-4 flex flex-row max-w-full">
              <div className="flex-1 overflow-auto">
                <pre>
                  <code
                    ref={ref}
                    className="block overflow-auto font-mono bg-gray-200 p-2 border-gray-600 border-dashed border-4 w-full"
                  >
                    {html}
                  </code>
                </pre>
              </div>
              <div className="overflow-auto flex">
                <div className="m-auto px-2">
                  <a href="#" onClick={onCopy}>
                    <FontAwesomeIcon
                      className="ml-2 text-gray-600 hover:text-gray-300 fill-current w-4 h-4 mr-2"
                      icon={faCopy}
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
      isIdeal={domain.hasData}
    >
      <InnerDomainChart domain={domain.domain} />
    </NonIdealState>
  );
};

const isValidDomain = (v:string) => {
  if (!v) return false;
  var re = /^(?!:\/\/)([a-zA-Z0-9-]+\.){0,5}[a-zA-Z0-9-][a-zA-Z0-9-]+\.[a-zA-Z]{2,64}?$/gi;
  return re.test(v);
}

const AddDomain = ({
  onCancel,
  onCreateComplete,
}: {
  onCancel: () => void;
  onCreateComplete: () => void;
}) => {
  const [domain, setDomain] = useState("");
  const [validDomain, setValidDomain] = useState(false);
  const [isPublic, setPublic] = useState(false);
  const [, executeMutation] = useMutation(gql`
    mutation AddDomain($domain: String!, $public: Boolean!) {
      createDomain(domain: $domain, public: $public)
    }
  `);

  return (
    <Card>
      <div className="flex-1 h-full w-full">
        <form className="w-full max-w-xl">
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
                onChange={(e) => {
                  setValidDomain(isValidDomain(e.target.value));
                  setDomain(e.target.value);
                }}
              />
              {!validDomain && (
                <p className="text-red-500 text-xs italic">
                  Enter a valid domain name (e.g. foo.com)
                </p>
              )}
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
              <span className="text-sm">
                Make statistics publicly accessible
              </span>
            </label>
          </div>
          <div className="md:flex md:items-center">
            <div className="md:w-1/3"></div>
            <div className="md:w-2/3">
              <button
                disabled={!validDomain}
                className={`${
                  !validDomain && "cursor-not-allowed opacity-75"
                } mr-2 shadow bg-green-500 hover:bg-green-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded`}
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
  domains?: Domain[];
  refetchDomains: () => void;
}) => {
  const [showAddDomain, setShowAddDomain] = useState(false);

  return (
    <>
      <div className="flex flex-row">
        <Title>Domains</Title>
        <div className="py-2">
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

      {domains?.map((domain) => (
        <Card key={domain.id} style={{ height: "15rem" }}>
          <CardTitle>
            <Link
              href="/domain/[domain]"
              as={`/domain/${encodeURIComponent(domain.domain)}`}
            >
              <a className="hover:text-gray-500">{domain.domain}</a>
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


const Page = () => {
  const [query, reexecuteQuery] = useQuery<{ domains: Domain[] }>({
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

  return (
    <Layout title="beampipe | domains">
      <div className="container mx-auto">
        <DomainList
          domains={query.data?.domains}
          refetchDomains={() =>
            reexecuteQuery({ requestPolicy: "network-only" })
          }
        />
      </div>
    </Layout>
  );
};

Page.getInitialProps = secured;
export default withUrql(Page);

import Link from "next/link";
import { Layout } from "../components/layout/Layout";
import { withUrql } from "../utils/withUrql";
import { useQuery, useMutation } from "urql";
import gql from "graphql-tag";
import { Card, CardTitle } from "../components/Card";
import { LineChart } from "../components/viz/LineChart";
import { Button } from "../components/Buttons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faCopy,
  faCog,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useRef, MouseEventHandler } from "react";
import { NonIdealState } from "../components/NonIdealState";
import _ from "lodash";
import { secured } from "../utils/auth";
import { Title } from "../components/Title";
import { Domain } from "../interfaces";
import { Spinner } from "../components/Spinner";
import { Stats } from "../components/viz/Stats";

const ScriptSnippet = ({ domain }: { domain: Domain }) => {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const html = `<script async defer src="https://beampipe.io/js/tracker.js" data-beampipe-domain="${domain.domain}"></script>`;
  const [hasCopied, setHasCopied] = useState(false);

  const onCopy: MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.preventDefault();
    if (ref.current) {
      const dummy = document.createElement("textarea");
      document.body.appendChild(dummy);
      dummy.value = html;
      dummy.select();
      document.execCommand("copy");
      document.body.removeChild(dummy);
      setHasCopied(true);
    }
  };

  return (
    <div className="text-center text-sm m-auto overflow-auto">
      Add the following snippet to your page to start collecting data.
      <div className="pt-4 flex flex-row max-w-full">
        <div className="flex-1 overflow-auto">
          <pre>
            <code
              ref={ref}
              className="block overflow-auto font-mono bg-gray-200 p-2 border-gray-600 border-dashed border-2 w-full"
            >
              {html}
            </code>
          </pre>
        </div>
        <div className="overflow-auto flex">
          <div className="m-auto px-2 text-gray-600">
            <a href="#" onClick={onCopy}>
              <FontAwesomeIcon
                className="ml-2 hover:text-gray-300 fill-current w-4 h-4 mr-2"
                icon={faCopy}
              />
            </a>
            {hasCopied ? (
              <div className="text-sm font-extrabold">Copied!</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

const InnerDomainChart = ({ domain }: { domain: string }) => {
  const [query] = useQuery({
    query: gql`
      query stats($domain: String!) {
        events(domain: $domain, timePeriod: { type: "week" }) {
          bucketed(bucketDuration: "day") {
            time
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
      <div className="h-48">
        <LineChart
          data={[
            {
              label: "Page views",
              data: query.data?.events?.bucketed,
              borderColor: "#0ba360",
            },
          ]}
          timePeriod={{ type: "week" }}
        />
      </div>
      <div className="flex flex-row flex-wrap pt-4">
        <Stats stats={query.data?.events} />
      </div>
    </NonIdealState>
  );
};

const DomainChart = ({ domain }: { domain: Domain }) => {
  return (
    <NonIdealState
      nonIdeal={
        <div className="text-center">
          <div className="text-xl text-gray-500 pb-4">
            This domain has not recorded any data
          </div>
          <ScriptSnippet domain={domain} />
        </div>
      }
      isIdeal={domain.hasData}
    >
      <InnerDomainChart domain={domain.domain} />
    </NonIdealState>
  );
};

const isValidDomain = (v?: string) => {
  if (!v) return false;
  var re = /^(?!:\/\/)([a-zA-Z0-9-]+\.){0,5}[a-zA-Z0-9-][a-zA-Z0-9-]+\.[a-zA-Z]{2,64}?$/gi;
  return re.test(v);
};

const AddOrEditDomain = ({
  domain,
  onCancel,
  onComplete,
}: {
  domain?: Domain;
  onCancel: () => void;
  onComplete: () => void;
}) => {
  const [domainName, setDomainName] = useState(domain?.domain);
  const [validDomain, setValidDomain] = useState(isValidDomain(domain?.domain));
  const [isPublic, setPublic] = useState(domain?.public || false);
  const [error, setError] = useState<string | null>(null);
  const [, executeMutation] = useMutation(gql`
    mutation createOrUpdateDomain(
      $id: UUID
      $domain: String!
      $public: Boolean!
    ) {
      createOrUpdateDomain(id: $id, domain: $domain, public: $public)
    }
  `);

  const [, executeDelete] = useMutation(gql`
    mutation deleteDomain($id: UUID!) {
      deleteDomain(id: $id)
    }
  `);

  return (
    <form className="w-full max-w-xl" onSubmit={(e) => e.preventDefault()}>
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
            data-cy="input-domain-name"
            value={domainName}
            onChange={(e) => {
              setValidDomain(isValidDomain(e.target.value));
              setDomainName(e.target.value);
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
          <span className="text-sm">Make statistics publicly accessible</span>
        </label>
      </div>

      {error && (
        <div className="md:flex md:items-center mb-6">
          <div className="md:w-1/3"></div>
          <div className="md:w-2/3">
            <p className="text-red-500 italic">{error}</p>
          </div>
        </div>
      )}

      <div className="md:flex md:items-center">
        <div className="md:w-1/3"></div>
        <div className="md:w-2/3">
          <Button
            disabled={!validDomain}
            data-cy="button-save-domain"
            onClick={async () => {
              const result = await executeMutation({
                id: domain?.id,
                domain: domainName,
                public: isPublic,
              });

              if (!result.error) {
                onComplete();
              } else {
                setError(
                  result.error.graphQLErrors[0]?.extensions?.userMessage
                );
              }
            }}
          >
            Save
          </Button>
          <Button
            className="mx-2"
            type="button"
            intent="info"
            onClick={onCancel}
          >
            Cancel
          </Button>

          {domain && (
            <Button
              className="float-right"
              type="button"
              intent="danger"
              data-cy="button-domain-delete"
              onClick={async () => {
                if (confirm("Are you sure you want to delete this domain?")) {
                  const result = await executeDelete({ id: domain.id });

                  if (!result.error) {
                    onComplete();
                  }
                }
              }}
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    </form>
  );
};

type DomainCardState = "chart" | "editing" | "code";

const DomainCard: React.FunctionComponent<{
  domain: Domain;
  refetchDomains: () => void;
}> = ({ domain, refetchDomains }) => {
  const [state, setState] = useState<DomainCardState>("chart");

  const renderInner = (state: DomainCardState) => {
    switch (state) {
      case "chart":
        return <DomainChart domain={domain} />;
      case "code":
        return (
          <div className="flex-1 flex">
            <ScriptSnippet domain={domain} />
          </div>
        );
      case "editing":
        return (
          <AddOrEditDomain
            domain={domain}
            onComplete={() => {
              setState("chart");
              refetchDomains();
            }}
            onCancel={() => setState("chart")}
          />
        );
    }
  };

  return (
    <Card key={domain.id} style={{ minHeight: "15rem" }}>
      <CardTitle>
        <div className="flex">
          <div className="flex-auto overflow-auto">
            <Link
              href="/domain/[domain]"
              as={`/domain/${encodeURIComponent(domain.domain)}`}
            >
              <a data-cy="a-domain" className="hover:text-gray-500 break-words">
                {domain.domain}
              </a>
            </Link>
          </div>

          <div className="flex-none">
            {state !== "editing" && (
              <>
                <a
                  href="#"
                  data-cy="button-domain-settings"
                  className="text-gray-600 hover:text-gray-500"
                  onClick={(e) => {
                    setState("editing");
                    e.preventDefault();
                  }}
                >
                  <FontAwesomeIcon
                    size="sm"
                    className="fill-current w-4 h-4 mr-2"
                    icon={faCog}
                  />
                </a>
                <a
                  href="#"
                  className={`${
                    state === "code"
                      ? "text-green-600 hover:text-green-500"
                      : "hover:text-gray-500 text-gray-600"
                  }`}
                  onClick={(e) => {
                    setState((state) => (state === "code" ? "chart" : "code"));
                    e.preventDefault();
                  }}
                >
                  <FontAwesomeIcon
                    size="sm"
                    className="fill-current w-4 h-4 mr-2"
                    icon={faQuestionCircle}
                  />
                </a>
              </>
            )}
          </div>
        </div>
      </CardTitle>
      {renderInner(state)}
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
      <div className="flex flex-col md:flex-row">
        <Title>Dashboard</Title>
        <div className="py-2 flex flex-row items-center">
          <div className="flex-1">
            <Link href="/settings">
              <a className="text-sm text-gray-600 hover:text-gray-900 font-semibold mr-4">
                <FontAwesomeIcon
                  className="fill-current w-4 h-4 mr-2"
                  icon={faCog}
                />
                Settings
              </a>
            </Link>
          </div>
          <div>
            <Button onClick={() => setShowAddDomain(true)}>
              <FontAwesomeIcon
                className="fill-current w-4 h-4 mr-2"
                icon={faPlus}
              />
              Add
            </Button>
          </div>
        </div>
      </div>

      {domains?.length === 0 && !showAddDomain && (
        <div className="py-12 text-xl text-gray-600 text-center font-extrabold">
          You haven't setup any domains yet.
          <div className="text-green-600 hover:text-green-500 pt-4 underline">
            <a
              href="#"
              data-cy="add-domain"
              onClick={() => setShowAddDomain(true)}
            >
              Add a domain to get started
            </a>
          </div>
        </div>
      )}

      {showAddDomain && (
        <Card>
          <div className="flex-1 h-full w-full">
            <AddOrEditDomain
              onCancel={() => setShowAddDomain(false)}
              onComplete={() => {
                setShowAddDomain(false);
                refetchDomains();
              }}
            />
          </div>
        </Card>
      )}

      {domains?.map((domain) => (
        <DomainCard
          key={domain.id}
          domain={domain}
          refetchDomains={refetchDomains}
        />
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
          public
          hasData
        }
      }
    `,
  });

  return (
    <Layout title="domains">
      <div className="container mx-auto">
        {!query.fetching ? (
          <DomainList
            domains={query.data?.domains}
            refetchDomains={() =>
              reexecuteQuery({ requestPolicy: "network-only" })
            }
          />
        ) : (
          <Spinner />
        )}
      </div>
    </Layout>
  );
};

Page.getInitialProps = secured;
export default withUrql(Page);

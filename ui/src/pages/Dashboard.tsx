import { Layout } from "../components/layout/Layout";
import { useQuery, useMutation, gql } from "urql";
import numeral from "numeral";
import { LineChart } from "../components/viz/LineChart";
import { Link } from "react-router-dom";
import {
  AlertCircleIcon,
  ArrowRightIcon,
  CheckIcon,
  CodeIcon,
  CopyIcon,
  GlobeIcon,
  PlusIcon,
  SettingsIcon,
} from "lucide-react";
import { useState, ReactNode } from "react";
import { NonIdealState } from "../components/NonIdealState";
import _ from "lodash";
import { Domain } from "../interfaces";
import { Spinner } from "../components/Spinner";
import { Stats } from "../components/viz/Stats";
import { Secure } from "../components/Secure";
import { PageHeader } from "../components/Title";
import { ConfirmButton } from "../components/ConfirmButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const domainPath = (domain: Domain) =>
  `/domain/${encodeURIComponent(domain.domain)}`;

const ScriptSnippet = ({ domain }: { domain: Domain }) => {
  const html = `<script async defer src="https://beampipe.io/js/tracker.js" data-beampipe-domain="${domain.domain}"></script>`;
  const [hasCopied, setHasCopied] = useState(false);

  const onCopy = async () => {
    await navigator.clipboard.writeText(html);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3 text-sm">
      <p className="text-muted-foreground">
        Add the following snippet to your page to start collecting data.
      </p>
      <div className="flex items-start gap-2 rounded-lg border bg-muted/50 p-3">
        <code className="min-w-0 flex-1 font-mono text-xs break-all text-foreground">
          {html}
        </code>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onCopy}
              aria-label="Copy snippet"
            >
              {hasCopied ? <CheckIcon className="text-primary" /> : <CopyIcon />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{hasCopied ? "Copied!" : "Copy"}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

const InnerDomainChart = ({ domain }: { domain: string }) => {
  const timePeriod = { type: "week" };

  const [query] = useQuery({
    query: gql`
      query stats($domain: String!, $timePeriod: TimePeriodInput!) {
        events(domain: $domain, timePeriod: $timePeriod) {
          bucketedUnique(bucketDuration: "day") {
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
      timePeriod,
    },
  });

  return (
    <NonIdealState
      nonIdeal={
        <div className="py-8 text-center text-sm text-muted-foreground">
          No events recorded in the past {timePeriod.type}
        </div>
      }
      isIdeal={
        !_.every(query.data?.events?.bucketedUnique, (x) => x.count === 0)
      }
      isLoading={query.fetching}
    >
      <div className="flex flex-row flex-wrap gap-6 pb-4">
        <Stats stats={query.data?.events} />
      </div>
      <div className="h-40">
        <LineChart
          data={[
            {
              data: query.data?.events?.bucketedUnique,
              type: "bar",
              yAxisID: "visitors",
              backgroundColor: (context: any) => {
                return context.dataset.data[context.dataIndex].x.getDay() %
                  6 ===
                  0
                  ? "rgba(22, 163, 74, 0.35)"
                  : "rgba(22, 163, 74, 0.75)";
              },
              label: "Unique visitors",
            },
          ]}
          timePeriod={{ type: "week" }}
        />
      </div>
    </NonIdealState>
  );
};

const isValidDomain = (v?: string) => {
  if (!v) return false;
  var re =
    /^(?!:\/\/)([a-zA-Z0-9-]+\.){0,5}[a-zA-Z0-9-][a-zA-Z0-9-]+\.[a-zA-Z]{2,64}?$/gi;
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
  const [domainName, setDomainName] = useState(domain?.domain ?? "");
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

  const save = async () => {
    const result = await executeMutation({
      id: domain?.id,
      domain: domainName,
      public: isPublic,
    });

    if (!result.error) {
      onComplete();
    } else {
      setError(
        result.error.graphQLErrors[0]?.extensions?.userMessage as string
      );
    }
  };

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (validDomain) save();
      }}
    >
      <FieldGroup>
        <Field data-invalid={domainName !== "" && !validDomain}>
          <FieldLabel htmlFor="domain">Domain</FieldLabel>
          <Input
            id="domain"
            placeholder="example.com"
            data-cy="input-domain-name"
            value={domainName}
            aria-invalid={domainName !== "" && !validDomain}
            onChange={(e) => {
              setValidDomain(isValidDomain(e.target.value));
              setDomainName(e.target.value);
            }}
          />
          {domainName !== "" && !validDomain ? (
            <FieldError>Enter a valid domain name (e.g. example.com)</FieldError>
          ) : (
            <FieldDescription>
              The domain you will add the tracking snippet to.
            </FieldDescription>
          )}
        </Field>
        <Field orientation="horizontal">
          <Checkbox
            id="domain-public"
            checked={isPublic}
            onCheckedChange={(checked) => setPublic(checked === true)}
          />
          <FieldLabel htmlFor="domain-public" className="font-normal">
            Make statistics publicly accessible
          </FieldLabel>
        </Field>
      </FieldGroup>

      {error && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" disabled={!validDomain} data-cy="button-save-domain">
          Save
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>

        {domain && (
          <ConfirmButton
            trigger={
              <Button
                type="button"
                variant="destructive"
                className="ml-auto"
                data-cy="button-domain-delete"
              >
                Delete domain
              </Button>
            }
            title={`Delete ${domain.domain}?`}
            description="This permanently deletes the domain and all of its analytics data."
            confirmLabel="Delete domain"
            onConfirm={async () => {
              const result = await executeDelete({ id: domain.id });

              if (!result.error) {
                onComplete();
              }
            }}
          />
        )}
      </div>
    </form>
  );
};

const IconAction = ({
  label,
  active,
  onClick,
  children,
  ...otherProps
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
  "data-cy"?: string;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={label}
        aria-pressed={active}
        className={active ? "bg-muted text-primary" : "text-muted-foreground"}
        onClick={onClick}
        {...otherProps}
      >
        {children}
      </Button>
    </TooltipTrigger>
    <TooltipContent>{label}</TooltipContent>
  </Tooltip>
);

type DomainCardState = "chart" | "editing" | "code";

const DomainCard: React.FunctionComponent<{
  domain: Domain;
  refetchDomains: () => void;
}> = ({ domain, refetchDomains }) => {
  const [state, setState] = useState<DomainCardState>("chart");

  const renderInner = (state: DomainCardState) => {
    switch (state) {
      case "chart":
        return domain.hasData ? (
          <Link
            to={domainPath(domain)}
            className="group/chart relative -mx-2 block rounded-lg p-2 transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            aria-label={`View full dashboard for ${domain.domain}`}
          >
            <InnerDomainChart domain={domain.domain} />
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover/chart:opacity-100 group-focus-visible/chart:opacity-100">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background shadow-lg">
                View full dashboard
                <ArrowRightIcon className="size-3.5" />
              </span>
            </span>
          </Link>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-sm font-medium text-foreground">
              This domain has not recorded any data yet.
            </p>
            <ScriptSnippet domain={domain} />
          </div>
        );
      case "code":
        return <ScriptSnippet domain={domain} />;
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
    <Card className="pb-2 transition-shadow hover:shadow-md hover:ring-primary/30">
      <CardHeader>
        <CardTitle className="flex min-w-0 items-center gap-2 text-lg font-semibold">
          <Link
            to={domainPath(domain)}
            data-cy="a-domain"
            className="truncate hover:text-primary"
          >
            {domain.domain}
          </Link>
          {domain.public && (
            <Badge variant="secondary" className="font-normal">
              <GlobeIcon />
              Public
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Unique visitors, last 7 days</CardDescription>
        {state !== "editing" && (
          <CardAction className="flex gap-1">
            <IconAction
              label={state === "code" ? "Hide tracking snippet" : "Show tracking snippet"}
              active={state === "code"}
              onClick={() =>
                setState((state) => (state === "code" ? "chart" : "code"))
              }
            >
              <CodeIcon />
            </IconAction>
            <IconAction
              label="Domain settings"
              data-cy="button-domain-settings"
              onClick={() => setState("editing")}
            >
              <SettingsIcon />
            </IconAction>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>{renderInner(state)}</CardContent>
      {state !== "editing" && (
        <CardFooter className="justify-end border-t pt-2!">
          <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary">
            <Link to={domainPath(domain)}>
              View dashboard
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

const UsageStat = ({
  label,
  value,
  max,
  children,
}: {
  label: string;
  value: ReactNode;
  max?: ReactNode;
  children?: ReactNode;
}) => (
  <Card size="sm">
    <CardContent>
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-semibold tracking-tight capitalize tabular-nums">
          {value}
        </span>
        {max != null && (
          <span className="text-sm text-muted-foreground">/ {max}</span>
        )}
      </div>
      {children}
    </CardContent>
  </Card>
);

const DomainList = ({
  domains,
  refetchDomains,
}: {
  domains?: Domain[];
  refetchDomains: () => void;
}) => {
  const [showAddDomain, setShowAddDomain] = useState(false);

  const [query] = useQuery({
    query: gql`
      query settings {
        settings {
          subscription
          visitors
          domains {
            current
            max
          }
          pageViews {
            current
            max
          }
        }
      }
    `,
  });

  const settings = query.data?.settings;

  return (
    <>
      <PageHeader
        title="Your sites"
        description="Click a site to see its full analytics dashboard."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/settings">
                <SettingsIcon />
                Settings
              </Link>
            </Button>
            <Button onClick={() => setShowAddDomain(true)}>
              <PlusIcon />
              Add domain
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 pb-8 lg:grid-cols-4">
        <UsageStat label="Subscription" value={settings?.subscription ?? "–"}>
          {settings?.subscription === "basic" ? (
            <Link
              to="/settings"
              className="text-xs font-medium text-primary hover:underline"
            >
              Upgrade
            </Link>
          ) : null}
        </UsageStat>
        <UsageStat
          label="Domains"
          value={settings?.domains.current ?? "–"}
          max={settings?.domains.max}
        />
        <UsageStat
          label="Monthly views"
          value={settings ? numeral(settings.pageViews.current).format("0.[0]a") : "–"}
          max={settings && numeral(settings.pageViews.max).format("0.[0]a")}
        />
        <UsageStat
          label="Monthly visitors"
          value={settings ? numeral(settings.visitors).format("0.[0]a") : "–"}
        />
      </div>

      {showAddDomain && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Add a domain</CardTitle>
          </CardHeader>
          <CardContent className="max-w-xl">
            <AddOrEditDomain
              onCancel={() => setShowAddDomain(false)}
              onComplete={() => {
                setShowAddDomain(false);
                refetchDomains();
              }}
            />
          </CardContent>
        </Card>
      )}

      {domains?.length === 0 && !showAddDomain && (
        <Card>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <GlobeIcon />
              </EmptyMedia>
              <EmptyTitle>No domains yet</EmptyTitle>
              <EmptyDescription>
                Add a domain, then drop the tracking snippet on your site to
                start collecting analytics.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button data-cy="add-domain" onClick={() => setShowAddDomain(true)}>
                <PlusIcon />
                Add a domain to get started
              </Button>
            </EmptyContent>
          </Empty>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {domains?.map((domain) => (
          <DomainCard
            key={domain.id}
            domain={domain}
            refetchDomains={refetchDomains}
          />
        ))}
      </div>
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
      <Secure>
        <div className="container mx-auto px-4 pb-12">
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
      </Secure>
    </Layout>
  );
};

export default Page;

import { Layout } from "../components/layout/Layout";
import { useQuery, useMutation, gql } from "urql";
import { Spinner } from "../components/Spinner";
import numeral from "numeral";

import { loadStripe } from "@stripe/stripe-js";
import { PageHeader } from "../components/Title";
import { CheckIcon, PencilIcon, XIcon } from "lucide-react";
import { useState, ReactNode, PropsWithChildren } from "react";
import { getTimezones, renderTimeZone } from "../utils/timezones";
import { BasicBullets, ProBullets } from "@beampipe/components";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Separator } from "@/components/ui/separator";

 const stripePromise = import.meta.env.VITE_STRIPE_KEY ? loadStripe(import.meta.env.VITE_STRIPE_KEY) : null;

interface EditableFieldProps {
  label: string;
  initialValue: string;
  onSave: (val: string) => Promise<string | null>;
  renderValue?: (val: string) => ReactNode;
}

const EditableField = ({
  label,
  initialValue,
  onSave,
  renderChildren,
  renderValue = (val) => <>{val}</>,
}: EditableFieldProps & {
  renderChildren: ({
    value,
    setValue,
  }: {
    value: string;
    setValue: (value: string) => void;
  }) => ReactNode;
}) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  const save = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const result = await onSave(value);

    if (result === null) {
      setEditing(false);
      setError(null);
    } else {
      setError(result);
    }
  };

  const cancel = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setValue(initialValue);
    setEditing(false);
    setError(null);
  };

  return (
    <div className="grid gap-2 py-4 sm:grid-cols-3 sm:items-center sm:gap-4">
      <div className="text-sm font-medium text-foreground">{label}</div>
      <div className="flex min-w-0 items-center gap-2 sm:col-span-2">
        {editing ? (
          <form onSubmit={save} className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                {renderChildren({ value, setValue })}
              </div>
              <Button type="submit" size="icon-sm" aria-label="Save">
                <CheckIcon />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Cancel"
                onClick={cancel}
              >
                <XIcon />
              </Button>
            </div>
            {error && <FieldError>{error}</FieldError>}
          </form>
        ) : (
          <>
            <div className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
              {value ? renderValue(value) : "Not set"}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                setEditing(true);
                e.preventDefault();
              }}
            >
              <PencilIcon />
              Edit
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

const EditableText = (props: EditableFieldProps & { type?: string }) => (
  <EditableField
    {...props}
    renderChildren={({ value, setValue }) => (
      <Input
        type={props.type ?? "text"}
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    )}
  />
);

const EditableSelect: React.FunctionComponent<PropsWithChildren<EditableFieldProps>> = ({
  children,
  ...props
}) => (
  <EditableField
    {...props}
    renderChildren={({ value, setValue }) => (
      <NativeSelect
        className="w-full"
        onChange={(e) => setValue(e.target.value)}
        value={value}
      >
        {children}
      </NativeSelect>
    )}
  />
);

const PlanCard = ({
  name,
  current,
  children,
  action,
}: {
  name: string;
  current: boolean;
  children: ReactNode;
  action?: ReactNode;
}) => (
  <div
    className={`flex flex-col rounded-lg p-5 ring-1 ${
      current ? "bg-primary/5 ring-primary/40" : "ring-border"
    }`}
  >
    <div className="flex items-center justify-between gap-2">
      <div className="text-lg font-semibold">{name}</div>
      {current && <Badge>Current plan</Badge>}
    </div>
    <div className="mt-3 flex-1 text-sm text-foreground">{children}</div>
    {action && <div className="mt-4">{action}</div>}
  </div>
);

const Settings = () => {
  const [query, rexecuteQuery] = useQuery({
    query: gql`
      query settings {
        settings {
          name
          email
          accountId
          subscription
          timeZone
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

  const [, subscribe] = useMutation(gql`
    mutation subscribe {
      subscribe
    }
  `);

  const [, updateName] = useMutation(gql`
    mutation updateName($name: String!) {
      updateName(name: $name)
    }
  `);

  const [, updateEmail] = useMutation(gql`
    mutation updateEmail($email: String!) {
      updateEmail(email: $email)
    }
  `);

  const [, updateTimeZone] = useMutation(gql`
    mutation updateTimeZone($timeZone: String!) {
      updateTimeZone(timeZone: $timeZone)
    }
  `);

  if (query.fetching) {
    return (
      <Layout title="settings">
        <Spinner />
      </Layout>
    );
  }

  const settings = query.data?.settings;

  const onSubscribeClick = async () => {
    const subscriptionData = await subscribe();
    const stripe = await stripePromise;

    await stripe?.redirectToCheckout({
      sessionId: subscriptionData.data.subscribe,
    });
  };

  const saveResult = async (result: { error?: any }) => {
    if (result.error) {
      return result.error.graphQLErrors[0].extensions?.userMessage as string;
    } else {
      await rexecuteQuery({ requestPolicy: "network-only" });
      return null;
    }
  };

  const isPro = settings.subscription === "pro";

  return (
    <Layout title="settings">
      <div className="container mx-auto flex max-w-4xl flex-col gap-6 px-4 pb-12">
        <PageHeader title="Settings" description="Manage your plan, account and integrations." />

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Subscription</CardTitle>
            <CardDescription>
              {isPro ? "You're on the Pro plan." : "You're on the free Basic plan."}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {!isPro && (
              <PlanCard name="Basic" current>
                <BasicBullets />
              </PlanCard>
            )}
            <PlanCard
              name="Pro"
              current={isPro}
              action={
                isPro ? (
                  <a
                    className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
                    href={`mailto:hello@beampipe.io?subject=Cancel account ${settings.accountId}`}
                  >
                    Cancel subscription
                  </a>
                ) : (
                  <Button className="w-full" onClick={onSubscribeClick}>
                    Upgrade to Pro
                  </Button>
                )
              }
            >
              <ProBullets />
            </PlanCard>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Usage</CardTitle>
            <CardDescription>Usage against your plan's limits this month.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {[
              {
                label: "Domains",
                current: settings.domains.current,
                max: settings.domains.max,
                format: (n: number) => n,
              },
              {
                label: "Monthly page views",
                current: settings.pageViews.current,
                max: settings.pageViews.max,
                format: (n: number) => numeral(n).format("0.[0]a"),
              },
            ].map((usage) => (
              <div key={usage.label} className="rounded-lg bg-muted/50 p-4">
                <div className="text-xs font-medium text-muted-foreground">
                  {usage.label}
                </div>
                <div className="mt-1 text-2xl font-semibold tabular-nums">
                  {usage.format(usage.current)}
                  <span className="text-sm font-normal text-muted-foreground">
                    {" "}
                    / {usage.format(usage.max)}
                  </span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${Math.min(100, usage.max > 0 ? (usage.current / usage.max) * 100 : 0)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Account details</CardTitle>
          </CardHeader>
          <CardContent>
            <EditableText
              label="Name"
              initialValue={settings?.name}
              onSave={async (v) => saveResult(await updateName({ name: v }))}
            />
            <Separator />
            <EditableText
              label="Email address"
              type="email"
              initialValue={settings?.email}
              onSave={async (v) => saveResult(await updateEmail({ email: v }))}
            />
            <Separator />
            <EditableSelect
              label="Display timezone"
              initialValue={settings?.timeZone}
              renderValue={renderTimeZone}
              onSave={async (v) =>
                saveResult(await updateTimeZone({ timeZone: v }))
              }
            >
              {getTimezones().map((name) => (
                <option key={name} value={name}>
                  {renderTimeZone(name)}
                </option>
              ))}
            </EditableSelect>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Integrations</CardTitle>
            <CardDescription>
              Get daily or weekly reports and event notifications in Slack.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/oauth/login/slack" className="inline-block">
              <img
                alt="Add to Slack"
                height="40"
                width="139"
                src="https://platform.slack-edge.com/img/add_to_slack.png"
                srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"
              />
            </a>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;

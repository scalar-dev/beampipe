import { Layout } from "../components/layout/Layout";
import { useQuery, useMutation, gql } from "urql";
import { Spinner } from "../components/Spinner";
import numeral from "numeral";

import { loadStripe } from "@stripe/stripe-js";
import { Link } from "react-router-dom";
import { Title } from "../components/Title";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencilAlt,
  faCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useState, ReactNode } from "react";
import { getTimezones, renderTimeZone } from "../utils/timezones";
import { BasicBullets, ProBullets } from "../components/marketing/Pricing";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);

interface EditableFieldProps {
  initialValue: string;
  onSave: (val: string) => Promise<string | null>;
  renderValue?: (val: string) => ReactNode;
}

const EditableField = ({
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
    } else {
      setError(result);
    }
  };

  const cancel = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setValue(initialValue);
    setEditing(false);
    setError(null);
  };

  return (
    <div className="flex flex-row">
      {editing ? (
        <form onSubmit={save}>
          {renderChildren({ value, setValue })}

          {error && <p className="text-red-500 pb-4 italic">{error}</p>}
        </form>
      ) : (
        renderValue(value)
      )}
      <div className="flex ml-4 text-gray-600">
        {!editing ? (
          <div>
            <button
              className="m-auto outline-none focus:outline-none"
              onClick={(e) => {
                setEditing(true);
                e.preventDefault();
              }}
            >
              <FontAwesomeIcon
                className="fill-current w-4 h-4 mr-2"
                icon={faPencilAlt}
              />
            </button>
          </div>
        ) : (
          <div className="flex flex-row">
            <button className="m-auto hover:text-gray-900 outline-none focus:outline-none" onClick={save}>
              <FontAwesomeIcon
                className="fill-current w-4 h-4 mr-2"
                icon={faCheck}
              />
            </button>
            <button className="m-auto hover:text-gray-900 outline-none focus:outline-none" onClick={cancel}>
              <FontAwesomeIcon
                className="fill-current w-4 h-4 mr-2"
                icon={faTimes}
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const EditableText = (props: EditableFieldProps) => (
  <EditableField
    {...props}
    renderChildren={({ value, setValue }) => (
      <input
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        id="username"
        name="username"
        type="text"
        placeholder="Email address"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    )}
  />
);

const EditableSelect: React.FunctionComponent<EditableFieldProps> = ({
  children,
  ...props
}) => (
  <EditableField
    {...props}
    renderChildren={({ value, setValue }) => (
      <div className="inline-block relative w-64">
        <select
          className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
          onChange={(e) => setValue(e.target.value)}
          value={value}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg
            className="fill-current h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    )}
  />
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
    return <Spinner />;
  }

  const settings = query.data?.settings;

  const onSubscribeClick = async () => {
    const subscriptionData = await subscribe();
    const stripe = await stripePromise;

    await stripe?.redirectToCheckout({
      sessionId: subscriptionData.data.subscribe,
    });
  };

  return (
    <Layout title="settings">
      <div className="container mx-auto">
        <Title>Settings</Title>

        <div className="p-4 bg-white rounded-md overflow-hidden shadow-md w-full">
          <div className="flex flex-col">
            <div className="text-2xl">Subscription</div>

            <div className="flex flex-row my-4 pb-4">
              <div className="mx-auto flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-8">
                {settings.subscription !== "pro" && (
                  <div className="p-4 font-bold">
                    <div className="text-2xl">Basic</div>
                    <BasicBullets />
                  </div>
                )}

                <div
                  className={`${
                    settings.subscription === "pro"
                      ? ""
                      : "cursor-pointer bg-gray-300 hover:bg-gray-200 rounded-md shadow-md"
                  } p-4 font-bold`}
                  onClick={
                    settings.subscription !== "pro"
                      ? onSubscribeClick
                      : undefined
                  }
                >
                  <div className="text-2xl">
                    {settings.subscription === "basic" ? "Upgrade to " : ""}
                    Pro
                  </div>
                  <ProBullets />

                  {settings.subscription === "pro" ? (
                    <a
                      className="text-xs hover:underline font-medium"
                      href={`mailto:hello@beampipe.io?subject=Cancel account ${settings.accountId}`}
                    >
                      Cancel subscription
                    </a>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="text-2xl border-t pt-4">Usage</div>

            <div className="pb-4 flex flex-row text-2xl text-gray-800 font-bold justify-center space-x-8">
              <div className="p-8">
                <div className="text-lg">Domains</div>
                <div className="text-gray-800">
                  {settings.domains.current} / {settings.domains.max}
                </div>
              </div>
              <div className="p-8">
                <div className="text-lg">Monthly page views</div>
                <div className="text-gray-800">
                  {numeral(settings.pageViews.current).format("0.[0]a")} /{" "}
                  {numeral(settings.pageViews.max).format("0.[0]a")}
                </div>
              </div>
            </div>

            <div className="text-2xl border-t pt-4">Details</div>

            <div className="flex flex-row p-4">
              <div className="text-right pr-4 w-1/2 font-bold">Name</div>
              <div>
                <EditableText
                  initialValue={settings?.name}
                  onSave={async (v) => {
                    const result = await updateName({ name: v });
                    if (result.error) {
                      return result.error.graphQLErrors[0].extensions
                        ?.userMessage as string;
                    } else {
                      await rexecuteQuery({ requestPolicy: "network-only" });
                      return null;
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex flex-row p-4">
              <div className="text-right pr-4 w-1/2 font-bold">
                Email address
              </div>
              <div>
                <EditableText
                  initialValue={settings?.email}
                  onSave={async (v) => {
                    const result = await updateEmail({ email: v });
                    if (result.error) {
                      return result.error.graphQLErrors[0].extensions
                        ?.userMessage as string;
                    } else {
                      await rexecuteQuery({ requestPolicy: "network-only" });
                      return null;
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex flex-row p-4">
              <div className="text-right pr-4 w-1/2 font-bold">
                Display timezone
              </div>
              <div>
                <EditableSelect
                  initialValue={settings?.timeZone}
                  renderValue={renderTimeZone}
                  onSave={async (v) => {
                    const result = await updateTimeZone({ timeZone: v });
                    if (result.error) {
                      return result.error.graphQLErrors[0].extensions
                        ?.userMessage as string;
                    } else {
                      await rexecuteQuery({ requestPolicy: "network-only" });
                      return null;
                    }
                  }}
                >
                  {getTimezones().map((name) => (
                    <option key={name} value={name}>
                      {renderTimeZone(name)}
                    </option>
                  ))}
                </EditableSelect>
              </div>
            </div>

            <div className="text-2xl pt-4 border-t mt-4">Integrations</div>

            <div className="flex flex-row p-4">
              <div className="mx-auto">
                <Link to="/oauth/login/slack">
                  <img
                    alt="Add to Slack"
                    height="40"
                    width="139"
                    src="https://platform.slack-edge.com/img/add_to_slack.png"
                    srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;

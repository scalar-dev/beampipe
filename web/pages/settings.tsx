import { AuthProvider, secured } from "../utils/auth";
import { Layout } from "../components/layout/Layout";
import { Button } from "../components/Buttons";
import { useQuery, useMutation } from "urql";
import gql from "graphql-tag";
import { Spinner } from "../components/Spinner";

import { loadStripe } from "@stripe/stripe-js";
import { Title } from "../components/Title";
import { withUrql } from "../utils/withUrql";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencilAlt,
  faCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useState, ReactNode } from "react";
import moment from "moment-timezone";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);

interface EditableFieldProps {
  initialValue: string;
  onSave: (val: string) => Promise<string | null>;
}

const EditableField = ({
  initialValue,
  onSave,
  renderChild,
}: EditableFieldProps & {
  renderChild: ({
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
          {renderChild({ value, setValue })}

          {error && <p className="text-red-500 pb-4 italic">{error}</p>}
        </form>
      ) : (
        <>{value}</>
      )}
      <div className="flex ml-4 text-gray-600">
        {!editing ? (
          <div>
            <a
              href="#"
              className="m-auto"
              onClick={(e) => {
                setEditing(true);
                e.preventDefault();
              }}
            >
              <FontAwesomeIcon
                className="fill-current w-4 h-4 mr-2"
                icon={faPencilAlt}
              />
            </a>
          </div>
        ) : (
          <div className="flex flex-row">
            <a href="#" className="m-auto hover:text-gray-900" onClick={save}>
              <FontAwesomeIcon
                className="fill-current w-4 h-4 mr-2"
                icon={faCheck}
              />
            </a>
            <a href="#" className="m-auto hover:text-gray-900" onClick={cancel}>
              <FontAwesomeIcon
                className="fill-current w-4 h-4 mr-2"
                icon={faTimes}
              />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

const EditableText = (props: EditableFieldProps) => (
  <EditableField
    {...props}
    renderChild={({ value, setValue }) => (
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
    renderChild={({ value, setValue }) => (
      <div className="inline-block relative w-64">
        <select
          className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
          value={value}
          onChange={(e) => setValue(e.target.value)}
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
          subscription
          timeZone
        }
      }
    `,
  });

  const [, subscribe] = useMutation(gql`
    mutation subscribe {
      subscribe
    }
  `);

  const [, cancel] = useMutation(gql`
    mutation cancel {
      cancelSubscription
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

  const onCancelClick = async () => {
    await cancel();
    rexecuteQuery({ requestPolicy: "network-only" });
  };

  return (
    <AuthProvider>
      <Layout title="beampipe - settings">
        <div className="container mx-auto">
          <Title>Settings</Title>

          <div className="p-4 bg-white rounded overflow-hidden shadow-lg w-full">
            <div className="flex flex-col">
              <div className="flex flex-row p-4">
                <div className="text-right pr-4 w-1/2">
                  Current subscription
                </div>
                <div>
                  {settings?.subscription === "pro" ? (
                    <>
                      <div className="font-extrabold">pro</div>
                      <div>
                        <Button onClick={onCancelClick}>Cancel</Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="font-extrabold">
                        {settings?.subscription}
                      </div>
                      <div>
                        <Button onClick={onSubscribeClick}>Upgrade</Button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-row p-4">
                <div className="text-right pr-4 w-1/2">Name</div>
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
                <div className="text-right pr-4 w-1/2">Email address</div>
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
                <div className="text-right pr-4 w-1/2">Display timezone</div>
                <div>
                  <EditableSelect
                    initialValue={settings?.timeZone}
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
                    {moment.tz.names().map((timezone) => (
                      <option>{timezone}</option>
                    ))}
                  </EditableSelect>
                </div>
              </div>

              <div className="flex flex-row p-4">
                <div className="text-right pr-4 w-1/2">Slack integration</div>
                <div>
                  <Link href="/oauth/login/slack">
                    <a>
                      <img
                        alt="Add to Slack"
                        height="40"
                        width="139"
                        src="https://platform.slack-edge.com/img/add_to_slack.png"
                        srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"
                      />
                    </a>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </AuthProvider>
  );
};

Settings.getInitialProps = secured;
export default withUrql(Settings);

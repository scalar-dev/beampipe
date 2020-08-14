import { AuthProvider, secured } from "../utils/auth";
import { Layout } from "../components/Layout";
import { Button } from "../components/Buttons";
import { useQuery, useMutation } from "urql";
import gql from "graphql-tag";
import { Spinner } from "../components/Spinner";

import { loadStripe } from "@stripe/stripe-js";
import { GreyTitle } from "../components/Title";
import { withUrql } from "../utils/withUrql";
import Link from "next/link";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);

const Settings = () => {
  const [query, rexecuteQuery] = useQuery({
    query: gql`
      query settings {
        settings {
          email
          subscription
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
          <GreyTitle>Settings</GreyTitle>

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

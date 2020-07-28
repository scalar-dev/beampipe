import { AuthProvider } from "../utils/auth";
import { Layout } from "../components/Layout";
import { BoldButton } from "../components/BoldButton";
import { useQuery, useMutation } from "urql";
import gql from "graphql-tag";
import { Spinner } from "../components/Spinner";

import { loadStripe } from "@stripe/stripe-js";
import { Title } from "../components/Title";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);

export default () => {
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
          <Title>Settings</Title>

          <div className="p-4 bg-white rounded overflow-hidden shadow-lg w-full">
            <div className="grid grid-cols-2">
              <div className="text-right pr-4">Current subscription</div>
              <div>
                {settings?.subscription === "pro" ? (
                  <>
                    <div className="font-extrabold">pro</div>
                    <div>
                      <BoldButton onClick={onCancelClick}>Cancel</BoldButton>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="font-extrabold">
                      {settings?.subscription}
                    </div>
                    <div>
                      <BoldButton onClick={onSubscribeClick}>
                        Upgrade
                      </BoldButton>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </AuthProvider>
  );
};

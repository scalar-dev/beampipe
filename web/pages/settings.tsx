import { AuthProvider } from "../utils/auth";
import { Layout } from "../components/Layout";
import { BoldButton } from "../components/BoldButton";
import { useQuery, useMutation } from "urql";
import gql from "graphql-tag";
import { Spinner } from "../components/Spinner";

import { loadStripe, Stripe } from "@stripe/stripe-js";
import { useEffect, useRef } from "react";

export default () => {
  const [query] = useQuery({
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

  const stripe = useRef<Stripe | null>(null);

  useEffect(() => {
    loadStripe(
      "pk_test_51H9w9rKrGSqzIeMTQCYV0kZQiXM4DFTIYGNbLOaIuMch6ORbzeUrsAyb4kiEtPfAzjmT3FA2KYwuvCwixfn5Rhxi00TVRtmxz8"
    ).then((val) => (stripe.current = val));
  }, []);

  if (query.fetching) {
    return <Spinner />;
  }

  const settings = query.data?.settings;

  const onSubscribeClick = async () => {
    const subscriptionData = await subscribe();

    await stripe.current?.redirectToCheckout({
      sessionId: subscriptionData.data.subscribe,
    });
  };

  const onCancelClick = async () => {
    await cancel();
  }

  return (
    <AuthProvider>
      <Layout title="beampipe - settings">
        <div className="container mx-auto">
          <div className="text-3xl font-extrabold">Settings</div>

          <div className="p-4 bg-white rounded overflow-hidden shadow-lg w-full">
            <div className="grid grid-cols-2">
              <div>Current subscription</div>
              {stripe.current && (
                <div>
                  {settings?.subscription === "basic" ? (
                    <>
                      <div className="font-extrabold">Basic</div>
                      <div>
                        <BoldButton onClick={onSubscribeClick}>
                          Upgrade
                        </BoldButton>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="font-extrabold">Pro</div>
                      <div>
                        <BoldButton onClick={onCancelClick}>
                          Cancel
                        </BoldButton>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </AuthProvider>
  );
};

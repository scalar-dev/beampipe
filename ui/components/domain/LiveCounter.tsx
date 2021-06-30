import { useQuery } from "urql";
import gql from "graphql-tag";
import { StatsCounter } from "../viz/Stats";
import { Spinner } from "../Spinner";
import numeral from "numeral";
import { useEffect } from "react";

export const LiveCounter = ({ domain }: { domain: string }) => {
  const [liveStats, executeQuery] = useQuery({
    query: gql`
      query stats($domain: String!) {
        liveUnique(domain: $domain)
      }
    `,
    requestPolicy: "network-only",
    variables: {
      domain,
    },
  });

  useEffect(() => {
    if (!liveStats.fetching) {
      const id = setTimeout(
        () => executeQuery({ requestPolicy: "network-only" }),
        5000
      );
      return () => clearTimeout(id);
    }
  }, [liveStats.fetching, executeQuery]);

  return (
    <StatsCounter
      value={
        liveStats.data ? (
          <div className="animate-pulse">
            {numeral(liveStats.data.liveUnique).format("0.[0]a")}
          </div>
        ) : (
          <Spinner />
        )
      }
      title="Online now"
      delta={null}
    />
  );
};

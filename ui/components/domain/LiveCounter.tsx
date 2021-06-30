import { useQuery } from "urql";
import gql from "graphql-tag";
import { StatsCounter } from "../viz/Stats";
import { Spinner } from "../Spinner";
import numeral from "numeral";

export const LiveCounter = ({ domain }: { domain: string }) => {
  const [liveStats] = useQuery({
    query: gql`
      query stats($domain: String!) {
        liveUnique(domain: $domain)
      }
    `,
    pollInterval: 5000,
    requestPolicy: "network-only",
    variables: {
      domain,
    },
  });
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

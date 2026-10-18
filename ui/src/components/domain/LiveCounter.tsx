import { gql, useQuery } from "urql";
import { StatsCounter } from "../viz/Stats";
import { Spinner } from "@/components/ui/spinner";
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
    const interval = setInterval(() => {
      executeQuery();
    }, 5000);
    return () => clearInterval(interval);
  }, [executeQuery]);

  return (
    <StatsCounter
      value={
        liveStats.data ? (
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            {numeral(liveStats.data.liveUnique).format("0.[0]a")}
          </div>
        ) : (
          <Spinner className="size-5 text-muted-foreground" />
        )
      }
      title="Online now"
      delta={null}
    />
  );
};

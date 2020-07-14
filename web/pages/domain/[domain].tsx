import Head from "next/head";
import { withUrql } from "../../utils/withUrql";
import { useRouter } from "next/router";
import { useQuery } from "urql";
import gql from "graphql-tag";
import { useRef, useEffect, useState } from "react";
import Chart from "chart.js";

const Root = () => {
  const router = useRouter();
  const canvasRef = useRef(null);
  const chart = useRef<Chart>();

  const [timePeriod, setTimePeriod] = useState("hour");

  const [data] = useQuery({
    query: gql`
      query bucketEvents($domain: String!, $bucketDuration: String!) {
        bucketEvents(domain: $domain, bucketDuration: $bucketDuration) {
          time
          count
        }
      }
    `,
    variables: {
      domain: router.query.domain,
      bucketDuration: timePeriod
    },
  });

  useEffect(() => {
    chart.current = new Chart(canvasRef.current!, {
      type: "line",
      options: {
        scales: {
          xAxes: [
            {
              type: "time",
              time: {
                unit: "hour",
              },
            },
          ],
        },
      },
    });
  }, []);

  if (chart.current && data.data) {
    chart.current.data.datasets = [
      {
        lineTension: 0,
        data: data.data.bucketEvents.map(
          ({ time, count }: { time: string; count: number }) => ({
            x: new Date(parseInt(time) * 1000.0),
            y: count,
          })
        ),
      },
    ];
    chart.current.update();
  }

  return (
    <div>
      <Head>
        <title>Root</title>
        <link rel="icon" href="/static/favicon.ico" />
      </Head>

      <h1>Analytics for {router.query.domain}</h1>

      <button onClick={() => setTimePeriod("hour")} style={{color: timePeriod === "hour" ? "red" : "blue"}}>Today</button>
      <button onClick={() => setTimePeriod("minute")} style={{color: timePeriod === "minute" ? "red" : "blue"}}>Last Hour</button>

      <div style={{ width: "40rem" }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default withUrql(Root);

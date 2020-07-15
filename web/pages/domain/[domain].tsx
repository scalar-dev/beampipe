import Head from "next/head";
import { withUrql } from "../../utils/withUrql";
import { useRouter } from "next/router";
import { useQuery } from "urql";
import gql from "graphql-tag";
import { useRef, useEffect, useState } from "react";
import Chart from "chart.js";

interface ButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  selected: Boolean;
}

const Button: React.FunctionComponent<ButtonProps> = ({
  selected,
  children,
  ...otherProps
}) => (
  <button
    className={`border-gray-300 text-xs font-bold py-2 px-4 border rounded ${
      selected ? "bg-gray-100 shadow-inner" : ""
    }`}
    {...otherProps}
  >
    {children}
  </button>
);

interface CardProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

const Card: React.FunctionComponent<CardProps> = ({
  children,
  ...otherProps
}) => (
  <div
    className="flex flex-col rounded overflow-hidden shadow-lg bg-white w-full p-4 mr-4 mb-4"
    {...otherProps}
  >
    {children}
  </div>
);

const Root = () => {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chart = useRef<Chart>();

  const [timePeriod, setTimePeriod] = useState("day");

  const timePeriodToBucket = (timePeriod: string) => {
    if (timePeriod === "day") return "hour";
    else if (timePeriod === "hour") return "minute";
    else if (timePeriod === "week") return "day";
    else return "day";
  };

  const [stats] = useQuery({
    query: gql`
      query stats(
        $domain: String!
        $bucketDuration: String!
        $timePeriodStart: String!
      ) {
        events(domain: $domain, timePeriodStart: $timePeriodStart) {
          bucketed(bucketDuration: $bucketDuration) {
            time
            count
          }

          countUnique
          count
        }
      }
    `,
    variables: {
      domain: router.query.domain,
      bucketDuration: timePeriodToBucket(timePeriod),
      timePeriodStart: timePeriod,
    },
  });

  useEffect(() => {
    chart.current = new Chart(canvasRef.current!, {
      type: "line",
      options: {
        legend: undefined,
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              type: "time",
              time: {
                unit: timePeriodToBucket(timePeriod),
              },
            },
          ],
        },
      },
    });
  }, []);

  if (chart.current && stats.data) {
    const gradient = canvasRef.current
      ?.getContext("2d")
      ?.createLinearGradient(0, 0, 0, 400);

    gradient!.addColorStop(0, "rgba(11, 163, 96, 255)");
    gradient!.addColorStop(1, "rgba(255,255,255,0)");

    chart.current.data.datasets = [
      {
        lineTension: 0,
        backgroundColor: gradient,
        borderColor: "#0ba360",
        pointRadius: 0,
        data: stats.data?.events?.bucketed.map(
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
        <title>alysis</title>
        <link rel="icon" href="/static/favicon.ico" />
      </Head>

      <div className="w-screen h-screen bg-gray-100">
        <div className="container m-auto">
          <nav className="flex items-center justify-between flex-wrap py-6">
            <div className="flex items-center flex-shrink-0 text-black mr-6">
              <span className="font-semibold text-xl tracking-tight">
                alysis
              </span>
            </div>
            {/* <div className="block lg:hidden">
              <button className="flex items-center px-3 py-2 border rounded text-teal-200 border-teal-400 hover:text-white hover:border-white">
                <svg
                  className="fill-current h-3 w-3"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>Menu</title>
                  <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
                </svg>
              </button>
            </div> */}
            {/* <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
              <div className="text-sm lg:flex-grow"></div>
              <div>
                <a
                  href="#"
                  className="inline-block text-sm px-4 py-2 leading-none border rounded text-black border-black hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0"
                >
                  Login
                </a>
              </div>
            </div> */}
          </nav>

          <div className="flex flex-col">
            <Card>
              <div className="flex flex-row">
                <div className="text-2xl flex-grow">
                  <span className="text-gray-500 mr-2 text-sm">domain</span>
                  {router.query.domain}
                </div>
                <div className="text-2xl mr-4">
                  <span className="text-gray-500 mr-2 text-sm">total</span>
                  {stats.data?.events.count}
                </div>
                <div className="text-2xl">
                  <span className="text-gray-500 mr-2 text-sm">unique</span>
                  {stats.data?.events.countUnique}
                </div>
              </div>
            </Card>
            <Card style={{ height: "20rem" }}>
              <div>
                <div className="float-right">
                  <Button
                    onClick={() => setTimePeriod("hour")}
                    selected={timePeriod === "hour"}
                  >
                    Last Hour
                  </Button>

                  <Button
                    onClick={() => setTimePeriod("day")}
                    selected={timePeriod === "day"}
                  >
                    Today
                  </Button>

                  <Button
                    onClick={() => setTimePeriod("week")}
                    selected={timePeriod === "week"}
                  >
                    This week
                  </Button>
                </div>
              </div>

              <div className="flex-1">
                <canvas ref={canvasRef} />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withUrql(Root);

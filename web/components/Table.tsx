import _ from "lodash";

interface TableProps {
  data: {
    key: string;
    count: number;
  }[];
}

const Bar = ({ percentage }: { percentage: number }) => (
  <svg width="100%" height="0.5rem">
      <rect
        fill="#0ba360"
        width={`${100.0 * percentage}%`}
        height="100%"
      ></rect>
  </svg>
);

export const Table = ({ data }: TableProps) => {
  if (data.length === 0) {
    return null;
  }

  const maxCount = _.maxBy(data, "count")!.count;

  return (
    <table className="max-w-full w-full">
      <tbody>
        {data?.map((item) => (
          <tr key={item.key}>
            <td className="max-w-xs px-4 text-xs font-mono truncate py-1 border-t-2">
              {item.key || "none"}
              <Bar percentage={item.count / maxCount} />
            </td>
            <td className="border-t-2 px-4">{item.count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

interface TableProps {
  data: {
    key: string;
    count: number;
  }[];
}

export const Table = ({ data }: TableProps) => (
  <table className="max-w-full w-full">
    <tbody>
      {data?.map((item) => (
        <tr key={item.key}>
          <td className="max-w-xs border px-4 text-xs font-mono truncate">{item.key || "none"}</td>
          <td className="border px-4">{item.count}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

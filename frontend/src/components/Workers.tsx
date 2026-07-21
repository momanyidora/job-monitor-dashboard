type Worker = {
  id: string;
  status: string;
  lastHeartbeat: string | null;
};

type Props = {
  workers: Worker[];
};

export default function Workers({ workers }: Props) {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-lg p-6">
      <h2 className="text-green-400">Workers</h2>
      <table className="w-full mt-4 text-sm">
        <thead className="border-b border-slate-700">
          <tr>
            <th>Worker</th>
            <th>Status</th>
            <th>Last Heartbeat</th>
          </tr>
        </thead>

        <tbody>
          {workers.map((worker) => (
            <tr key={worker.id}>
              <td>{worker.id}</td>
              <td>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-white text-xs font-semibold ${
                    worker.status === "alive" ? "bg-green-600" : "bg-red-600"
                  }`}
                >
                  {worker.status === "alive" ? "Alive" : "Dead"}
                </span>
              </td>
              <td>{worker.lastHeartbeat}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

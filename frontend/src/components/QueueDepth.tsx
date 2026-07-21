type QueueDepthItem = {
  type: string;
  count: number | string;
};

type QueueDepthProps = {
  queueDepth: QueueDepthItem[];
};

export default function QueueDepth({ queueDepth }: QueueDepthProps) {
  return (
    <div className="bg-slate-900 rounded-xl boreder border-slate-700 shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-cyan-400">Queue Depth</h2>

      {queueDepth.length === 0 ? (
        <p className="flex items-center justify-center h-28 text-slate-400">
          No queued jobs.
        </p>
      ) : (
        <table className="w-full mt-4 text-sm">
          <thead className="border-b border-slate-700">
            <tr>
              <th className="text-left py-2">Type</th>
              <th className="text-right py-2">Count</th>
            </tr>
          </thead>

          <tbody>
            {queueDepth.map((job) => (
              <tr
                key={job.type}
                className="border-b border-slate-800 hover:bg-slate-800"
              >
                <td className="py-3">{job.type}</td>

                <td className="text-right">{job.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

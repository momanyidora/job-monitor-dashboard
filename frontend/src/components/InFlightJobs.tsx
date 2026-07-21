type Job = {
  id: string;
  type: string;
  workerId: string | null;
  processingStartTime: string | null;
};

type Props = {
  jobs: Job[];
};

export default function InFlightJobs({ jobs }: Props) {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-lg p-6">
      <h2 className="text-yellow-400">In-Flight Jobs</h2>

      {jobs.length === 0 ? (
        <p>No jobs are currently being processed.</p>
      ) : (
        <table className="w-full mt-4 text-sm">
          <thead className="border-b border-slate-700">
            <tr className="border-b border-slate-800 hover:bg-slate-800">
              <th className="text-left py-3 font-semibold text-slate-300">
                Type
              </th>
              <th>Worker</th>
              <th>Started</th>
            </tr>
          </thead>

          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td className="py-3">{job.type}</td>
                <td>{job.workerId}</td>
                <td>{job.processingStartTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

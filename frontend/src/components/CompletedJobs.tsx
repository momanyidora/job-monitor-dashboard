type Job = {
  id: string;
  type: string;
  finishTime: string | null;
};

type Props = {
  jobs: Job[];
};

export default function CompletedJobs({ jobs }: Props) {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-lg p-6">
      <h2 className="text-emerald-400">Completed Jobs</h2>

      <table className="w-full mt-4 text-sm">
        <thead className="border-b border-slate-700">
          <tr className="border-b border-slate-800 hover:bg-slate-800">
            <th className="text-left py-3 font-semibold text-slate-300">
              Type
            </th>
            <th>Finished</th>
          </tr>
        </thead>

        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td className="py-3">{job.type}</td>
              <td>{job.finishTime}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

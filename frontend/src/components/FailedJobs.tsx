import { retryJob } from "../services/api";

type Job = {
  id: string;
  type: string;
  stackTrace: string | null;
};

type Props = {
  jobs: Job[];
};

export default function FailedJobs({ jobs }: Props) {
  async function handleRetry(id: string) {
    try {
      const result = await retryJob(id);

      console.log(result);

      alert("Job queued for retry.");
    } catch (error) {
      console.error(error);
      alert("Retry failed.");
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-lg p-6">
      <h2 className="text-red-400">Failed Jobs</h2>

      <table className="w-full mt-4 text-sm">
        <thead className="border-b border-slate-700">
          <tr className="border-b border-slate-800 hover:bg-slate-800">
            <th className="text-left py-3 font-semibold text-slate-300">
              Type
            </th>
            <th>Error</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td className="py-3">{job.type}</td>
              <td>{job.stackTrace}</td>
              <td>
                <button
                  onClick={() => handleRetry(job.id)}
                  className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition"
                >
                  Retry
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

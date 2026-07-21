import QueueDepth from "../components/QueueDepth";
import InFlightJobs from "../components/InFlightJobs";
import CompletedJobs from "../components/CompletedJobs";
import FailedJobs from "../components/FailedJobs";
import Workers from "../components/Workers";
import { useDashboard } from "../hooks/useDashboard";

export default function Dashboard() {
  const { queueDepth, inFlightJobs, completedJobs, failedJobs, workers } =
    useDashboard();

  return (
    <div className="max-w-screen-2xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-10">
        Background Job Monitor Dashboard
      </h1>
<p className="text-2xl font-bold">
Monitor queue activitity, workers and job execution in real time
</p>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <QueueDepth queueDepth={queueDepth} />

        <InFlightJobs jobs={inFlightJobs} />

        <Workers workers={workers} />
      </div>

      <div className="mt-8">
        <CompletedJobs jobs={completedJobs} />
      </div>

      <div className="mt-8">
        <FailedJobs jobs={failedJobs} />
      </div>
    </div>
  );
}

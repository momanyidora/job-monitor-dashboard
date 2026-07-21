import { useEffect, useState } from "react";
import {
  fetchCompletedJobs,
  fetchFailedJobs,
  fetchInFlightJobs,
  fetchQueueDepth,
  fetchWorkers,
} from "../services/api";
import { socket } from "../services/socket";

export function useDashboard() {
  const [queueDepth, setQueueDepth] = useState<any[]>([]);
  const [inFlightJobs, setInFlightJobs] = useState<any[]>([]);
  const [completedJobs, setCompletdJobs] = useState<any[]>([]);
  const [failedJobs, setFailedJobs] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      setQueueDepth(await fetchQueueDepth());
      setInFlightJobs(await fetchInFlightJobs());
      setCompletdJobs(await fetchCompletedJobs());
      setFailedJobs(await fetchFailedJobs());
      setWorkers(await fetchWorkers());
    }

    loadDashboard();
    socket.onmessage = async (message) => {
      console.log("WS message:", message.data);

      const { event } = JSON.parse(message.data);

      console.log("Event:", event);

      switch (event) {
        case "job_queued":
        case "job_claimed":
        case "job_completed":
        case "job_failed":
        case "jobs_reclaimed":
        case "job_retried":
        case "worker_heartbeat":
        case "worker_dead":
          await loadDashboard();
          break;
      }
    };
    return () => {
      socket.onmessage = null;
    };
  }, []);

  return {
    queueDepth,
    inFlightJobs,
    completedJobs,
    failedJobs,
    workers,
  };
}

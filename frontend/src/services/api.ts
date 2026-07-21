const BASE_URL = "/api/dashboard";

export async function fetchQueueDepth() {
  const response = await fetch(`${BASE_URL}/queue-depth`);
  return response.json();
}

export async function fetchInFlightJobs() {
  const response = await fetch(`${BASE_URL}/in-flight`);
  return response.json();
}

export async function fetchCompletedJobs() {
  const response = await fetch(`${BASE_URL}/completed`);
  return response.json();
}

export async function fetchFailedJobs() {
  const response = await fetch(`${BASE_URL}/failed`);
  return response.json();
}

export async function fetchWorkers() {
  const response = await fetch(`${BASE_URL}/workers`);
  return response.json();
}

export async function retryJob(jobId: string) {
  const response = await fetch(`${BASE_URL}/jobs/${jobId}/retry`, {
    method: "POST",
  });

  return response.json();
}

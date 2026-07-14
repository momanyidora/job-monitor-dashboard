// This helper keeps the job lifecycle rules in one place.
import { JobState } from "../types/job-state";

export function isValidTransition(current: JobState, next: JobState): boolean {
  // Only certain state changes are allowed in the queue lifecycle.
  const transitions: Record<JobState, JobState[]> = {
    [JobState.QUEUED]: [JobState.IN_FLIGHT],

    [JobState.IN_FLIGHT]: [JobState.COMPLETED, JobState.FAILED],

    [JobState.COMPLETED]: [],
    [JobState.FAILED]: [],
  };
  return transitions[current].includes(next);
}

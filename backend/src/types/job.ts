// This interface describes the shape of a background job entity.
import { JobState } from "./job-state";

export interface Job {
  id: string;
  type: string;
  payload: unknown;
  state: JobState;

  enqueueTime: Date;

  processingStartTime: Date | null;

  finishTime: Date | null;
}

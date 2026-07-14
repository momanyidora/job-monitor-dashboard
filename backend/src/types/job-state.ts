// This enum represents the valid states a job can move through.
export enum JobState {
  QUEUED = "queued",
  "IN_FLIGHT" = "in-flight",
  COMPLETED = "completed",
  FAILED = "failed",
}

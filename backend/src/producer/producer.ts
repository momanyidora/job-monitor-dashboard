// This module seeds the queue with a few sample jobs for local testing.
import { createJob } from "../services/job.service";

export async function enqueueJobs() {
  // Create a simple email job with the payload needed by the consumer.
  await createJob("send-email", {
    to: "john@example.com",
    subject: "welcome,",
  });

  // Add a report-generation task.
  await createJob("generate-report", {
    reportId: 12,
  });

  // Add a larger image-processing task.
  await createJob("resize-image", {
    image: "photo.jpg",
    width: 800,
    height: 600,
  });

  // Let the console know that the example jobs were queued successfully.
  console.log("Jobs added to queue.");
}

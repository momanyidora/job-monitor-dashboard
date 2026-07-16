import { Router } from "express";
import { completed, failed, inFlight, queueDepth, retryFailedJobs, workersList } from "../controllers/dashboard.controller";





const router = Router();

router.post("/jobs/:id/retry", retryFailedJobs)
router.get("/queue-depth", queueDepth)
router.get("/in-flight", inFlight);
router.get("/completed", completed);
router.get("/failed", failed);
router.get("/workers", workersList);

export default router;

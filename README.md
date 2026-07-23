# Background Job Monitor Dashboard

This is a full-stack system for monitoring background jobs the kind of "fire and forget" scripts that send emails, generate reports, or resize images. Before this, there was no way to see what was queued, what was running, or what had silently died. This project fixes that.

I built it as three separate Node/TypeScript processes (producer, worker, API/WebSocket server) all talking to one shared Postgres database, plus a React dashboard that updates live over WebSockets no polling, no refresh button.

## What This System Does

- A **producer** script drops jobs onto a queue (type + payload).
- One or more **worker** processes pick jobs off the queue, do the "work" (simulated), and mark them completed or failed.
- Workers send a **heartbeat** every 10 seconds so the system knows they're alive. If a worker goes quiet for more than 30 seconds, it's marked dead, and any job it was holding gets reclaimed and finished by another worker.
- An **API + WebSocket server** exposes everything over REST for the initial page load, then pushes live updates (job claimed, completed, failed, reclaimed, worker died, etc.) to any connected dashboard.
- A **React dashboard** shows queue depth per job type, in-flight jobs with elapsed time, the last 100 completed jobs, failed jobs with their stack traces (with a retry button), and every worker's live heartbeat status.

Three job types are seeded for testing: `send-email`, `generate-report` (this one is set up to fail on purpose so I could test the failure/retry path), and `resize-image`.

## Architecture (Diagram)

```
 ┌─────────────┐        ┌───────────────────┐        ┌─────────────┐
 │  Producer   │  INSERT│                   │ UPDATE │             │
 │ (one-off    ├───────►│   Postgres        │◄───────┤  Worker(s)  │
 │  script)    │        │  (jobs, workers   │        │  (1..N      │
 └─────────────┘        │   tables)         │        │  processes) │
                         └─────────┬─────────┘        └──────┬──────┘
                                   │   SELECT / detect         │
                                   │   dead workers / reclaim  │ heartbeat
                                   ▼                           │ every 10s
                         ┌───────────────────┐                 │
                         │  API + WebSocket  │◄────────────────┘
                         │  Server (Express  │
                         │  + ws)            │
                         └─────────┬─────────┘
                                   │ REST (initial load)
                                   │ WebSocket (live push)
                                   ▼
                         ┌───────────────────┐
                         │  React Dashboard  │
                         │  (Vite + Tailwind)│
                         └───────────────────┘
```

Every one of these producer, worker, server is its own process. They only share state through Postgres. The dashboard never talks directly to a worker; it only talks to the API/WebSocket server.

## Setup & Configuration

Nothing is hardcoded. Everything reads from environment variables.

Backend `.env` (in `/backend`):

```
DATABASE_URL=postgres://user:password@localhost:5432/job_monitor
PORT=3000
WS_PORT=3001
WORKER_ID=worker-1
```

- `DATABASE_URL` connection string for Postgres (used by every backend process)
- `PORT` the REST API port
- `WS_PORT` the WebSocket port
- `WORKER_ID` set this differently per worker process when you run more than one, e.g. `worker-1`, `worker-2`

Install dependencies and push the schema before running anything:

```bash
cd backend
npm install
npm run db:push
```

Frontend just needs:

```bash
cd frontend
npm install
```

The frontend proxies `/api` requests to `http://localhost:3000` (see `vite.config.ts`), and connects to the WebSocket server directly at `ws://localhost:3001`.

## Running the Producer

The producer is a one-shot script it enqueues a batch of jobs and exits. It never processes anything itself.

```bash
cd backend
npm run producer
```

Example: running it once seeds three jobs (`send-email`, `generate-report`, `resize-image`), all landing in the `queued` state with a fresh `enqueueTime`. Run it a few times in a row if you want to build up a bigger queue to watch on the dashboard.

## Running Workers

```bash
cd backend
npm run worker
```

Each worker needs its own `WORKER_ID` in the environment, since two workers can't share an identity. To test the "no two workers process the same job" behaviour, open two terminals with `WORKER_ID` set differently and run `npm run worker` in both, pointed at the same queue.

Example workflow testing reclaim by hand:

```bash
# terminal 1
WORKER_ID=worker-1 npm run worker
# it claims a job and starts "processing"...

# now kill it mid-job with Ctrl+C

# terminal 2
WORKER_ID=worker-2 npm run worker
# after the dead-worker check runs, worker-2 picks up
# the job that worker-1 was holding and finishes it
```

## Running the API & WebSocket Server

```bash
cd backend
npm run dev
```

This one command starts both the REST API (port from `PORT`) and the WebSocket server (port from `WS_PORT`) the WebSocket server is imported directly into `server.ts` so they come up together. This same process also runs the dead-worker check and reclaim sweep on an interval, so it needs to be running for reclaim to actually happen.

## Running the Dashboard

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`. On load it does one REST call per section to populate the initial state, then hands off to the WebSocket connection for everything after that.

## The Job Lifecycle

Every job has a `type`, a `payload`, and moves through these states:

```
queued ──► in-flight ──► completed
                     └──► failed ──► queued (via retry)
```

- `enqueueTime` is set the moment the producer creates it.
- `processingStartTime` is set when a worker claims it.
- `finishTime` is set when it's completed or failed.

Invalid jumps are rejected at the database layer you can't complete or fail a job that was never claimed, and you can't claim a job that isn't currently `queued`. Every transition goes through the same guarded update, so the job's full history (state + timestamps) can always be read back from the row itself.

A job also carries a `priority` (`normal` by default, or `high`). This is the piece I added for the day-2 requirement injection see Known Limitations below for where that stands right now.

## Worker Heartbeats & Dead Detection

- Every running worker sends a heartbeat **every 10 seconds**.
- The API server checks worker status on an interval. A worker whose last heartbeat is **more than 30 seconds old** is marked `dead`.
- If a "dead" worker starts heartbeating again, it flips back to `alive` nothing special has to happen for that, it just reflects the latest heartbeat timestamp.

The 30-second threshold (vs. the 10-second heartbeat) exists so that one missed heartbeat a slow tick, a GC pause, a brief network hiccup doesn't get a perfectly healthy worker marked dead and its in-flight job yanked away from it mid-processing. Three missed heartbeats in a row is a much stronger signal that the worker is actually gone.

## Job Reclaim

This is the core reliability piece of the whole sprint: a worker dying shouldn't mean a job dies with it.

- Once a worker is marked dead, any job it was holding (`in-flight`, assigned to that worker) is returned to `queued` `workerId` and `processingStartTime` get cleared.
- Any worker can then claim it like any other queued job, and finish it normally.
- A job on a worker that's still heartbeating even if it's a slow job is left alone. Reclaim only triggers off worker silence, not job duration.
- Because claiming a job is a single guarded update (claim only succeeds if the job is still `queued` at that instant), a reclaimed job can never end up being processed by two workers at once, even if the timing is close.

Example: kill `worker-1` with Ctrl+C while it's mid-job. Within the reclaim interval, that job flips back to `queued` in Postgres, and if `worker-2` is running, it picks the job up and completes it you'll see this reflected live on the dashboard without touching anything.

## Retrying Failed Jobs

Failed jobs aren't a dead end. From the dashboard, each failed job has a **Retry** button that hits:

```
POST /api/dashboard/jobs/:id/retry
```

This puts the job back in `queued` (clearing its `workerId`, timestamps, and stack trace), and it goes through the normal claim → process cycle again. Only jobs currently in the `failed` state can be retried trying to retry a `queued`, `in-flight`, or `completed` job returns a clear error instead of silently doing nothing, and retrying a job ID that doesn't exist returns a 404.

Example: `generate-report` jobs are set up to always fail in this project (on purpose, for testing). Enqueue one, let it fail, watch it show up in the Failed Jobs table with its stack trace, click Retry, and watch it go back through `queued` → `in-flight` → `failed` again live on the dashboard.

## Running Tests

```bash
cd backend
npm run test
```

This runs the full Vitest suite covering:

- Job lifecycle transitions, including invalid transitions
- Claiming (arrival order, no double-claims, two workers competing for one job)
- Heartbeat and dead detection, including the exact 30-second boundary and a worker that resumes heartbeating
- Reclaim, end-to-end: a killed worker's job gets picked up and finished elsewhere, a slow-but-alive worker keeps its job, and no job ever ends up on two workers
- Retry, across its full set of cases: successful retry, rejected retry for queued/in-flight/completed jobs, and 404 for an unknown job ID

## Known Limitations

- Job priority (`normal` / `high`) exists on the job record and the producer can set it, but the actual "high priority jobs jump the queue" ordering logic in the claim query is still being finished right now claiming is still strictly arrival-order regardless of priority. This is the piece from the day-2 requirement injection I'm still tightening up.
- The dashboard currently reloads all five data sections on any relevant WebSocket event rather than patching state surgically per event. It works and stays accurate, but it's not the most efficient approach under very high job throughput.
- Job payloads and "processing" are simulated (sleep + occasional forced failure on `generate-report`) rather than doing real work like actually sending an email or resizing an image this was intentional for the sprint, to keep the focus on the queue/reliability mechanics rather than the job content itself.
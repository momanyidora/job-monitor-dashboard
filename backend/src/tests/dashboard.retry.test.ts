import request from "supertest";
import { pool } from "../db";
import { afterAll, describe, expect, it } from "vitest";
import app from "../app";

describe("Retry API", () => {
  afterAll(async () => {
    await pool.end();
  });

  it("returns 404 when retrying an unknown job", async () => {
    const response = await request(app).post(
      "/api/dashboard/jobs/00000000-0000-0000-0000-000000000000/retry",
    );

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      message: "Failed job not found.",
    });
  });
});

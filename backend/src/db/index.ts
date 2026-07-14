// This file creates the PostgreSQL connection pool and the Drizzle database client.
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "../config/env";
import *  as schema from "./schema"

// The pool connects to Postgres using the configured database URL.
const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

// The Drizzle client is exported so the services can query and mutate data.
export const db = drizzle(pool,{
    schema,
});

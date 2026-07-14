// This configuration tells Drizzle where the schema lives and where migrations should be written.
import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
  dialect: "postgresql",

  schema: "./src/db/schema/index.ts",

  out: "./drizzle",

  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});

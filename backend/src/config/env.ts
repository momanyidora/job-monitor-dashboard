import dotenv from "dotenv";

dotenv.config();

export const env = {
    DATABASE_URL: process.env.DATABASE_URL,
    PORT: Number(process.env.PORT),
    WS_PORT: Number(process.env.WS_PORT),
    WORKER_ID: process.env.WORKER_ID!,
};
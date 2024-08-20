import dotenv from "dotenv";
import type { PoolOptions } from "mysql2";

dotenv.config();

export const PORT = Number(process.env.PORT) || 3000;
export const HOST = process.env.HOST || "localhost";

export const DB = {
  database: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  port: Number(process.env.DB_PORT) || undefined,
  password: process.env.DB_PASSWORD,
} satisfies PoolOptions;

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://user:pass@localhost:5432/db"
});

export const db = process.env.DATABASE_URL
  ? drizzle(pool, { schema })
  : {
    query: {},
    select: () => ({ from: () => [] }),
    insert: () => ({ values: () => ({ returning: () => [] }) })
  } as any;

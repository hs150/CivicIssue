import "dotenv/config";
import { pool } from "./db/index.js";

try {
  const result = await pool.query(`
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    ORDER BY tablename;
  `);

  console.log("Connected! Tables in database:");
  console.table(result.rows);
} catch (err) {
  console.error("Database check failed:", err.message);
} finally {
  await pool.end();
}


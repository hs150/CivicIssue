import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

let connectionString =
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/civicconnect";

if (connectionString) {
    connectionString = connectionString
        .replace("&channel_binding=require", "")
        .replace("channel_binding=require&", "");
}

const isLocalhost =
    connectionString.includes("localhost") ||
    connectionString.includes("127.0.0.1");

export const pool = new Pool({
    connectionString,
    ssl: isLocalhost ? false : { rejectUnauthorized: false },
    max: process.env.DB_MAX_CONNECTIONS ? parseInt(process.env.DB_MAX_CONNECTIONS) : 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000
});

pool.on("error", (error) => {
    console.error("PostgreSQL pool error:", error);
});

export async function query(text, params = []) {
    return pool.query(text, params);
}

export async function withTransaction(callback) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const result = await callback(client);

        await client.query("COMMIT");

        return result;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export async function closeDatabase() {
    await pool.end();
}

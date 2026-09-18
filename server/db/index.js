import pg from "pg";

const { Pool } = pg;

const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/civicconnect";

export const pool = new Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
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

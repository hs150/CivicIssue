import { pool } from "../db/index.js";

export async function connectDatabase() {
    try {
        await pool.query("SELECT 1");

        console.log("Connected to PostgreSQL.");

        return true;
    } catch (error) {
        console.error(
            "PostgreSQL connection failed:",
            error.message
        );

        throw error;
    }
}

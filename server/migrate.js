import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool, withTransaction } from "./db/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, "db", "migrations");

async function runMigrations() {
    console.log("🚀 Starting database migrations...");
    console.log(`Connecting to: ${process.env.DATABASE_URL ? "Custom DATABASE_URL configured" : "Local default"}`);

    // Create a schema migrations tracking table if not exists
    await pool.query(`
        CREATE TABLE IF NOT EXISTS _schema_migrations (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) UNIQUE NOT NULL,
            applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    `);

    const files = fs
        .readdirSync(migrationsDir)
        .filter((file) => file.endsWith(".sql"))
        .sort();

    console.log(`Found ${files.length} migration file(s):`, files);

    for (const file of files) {
        const check = await pool.query(
            "SELECT 1 FROM _schema_migrations WHERE name = $1",
            [file]
        );

        if (check.rowCount > 0) {
            console.log(`⏩ [Skipping] ${file} (already applied)`);
            continue;
        }

        console.log(`⚡ [Applying] ${file}...`);
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, "utf-8");

        await withTransaction(async (client) => {
            await client.query(sql);
            await client.query(
                "INSERT INTO _schema_migrations (name) VALUES ($1)",
                [file]
            );
        });

        console.log(`✅ [Applied]  ${file}`);
    }

    console.log("\n🎉 All database migrations applied successfully!");
}

runMigrations()
    .catch((err) => {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    })
    .finally(async () => {
        await pool.end();
    });

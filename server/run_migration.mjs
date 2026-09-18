import pg from "pg";
const p = new pg.Pool({ connectionString: "postgresql://postgres:Harsh123@localhost:5432/civicconnect" });
try {
  await p.query("ALTER TABLE issues ADD COLUMN IF NOT EXISTS resolution_image_url TEXT");
  await p.query("ALTER TABLE issues ADD COLUMN IF NOT EXISTS fix_verification JSONB NOT NULL DEFAULT '{}'::jsonb");
  console.log("Migration 002 applied successfully.");
} catch (e) {
  console.error(e.message);
} finally {
  await p.end();
}

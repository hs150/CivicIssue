-- Step 2: Proof-of-Fix AI Verification columns
ALTER TABLE issues ADD COLUMN IF NOT EXISTS resolution_image_url TEXT;
ALTER TABLE issues ADD COLUMN IF NOT EXISTS fix_verification JSONB NOT NULL DEFAULT '{}'::jsonb;

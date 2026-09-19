-- Migration 003: Citizen Community Sign-Off & Dispute Verification
ALTER TABLE issues ADD COLUMN IF NOT EXISTS citizen_confirmations INTEGER DEFAULT 0;
ALTER TABLE issues ADD COLUMN IF NOT EXISTS citizen_disputes INTEGER DEFAULT 0;
ALTER TABLE issues ADD COLUMN IF NOT EXISTS citizen_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE issues ADD COLUMN IF NOT EXISTS citizen_verifications JSONB DEFAULT '[]'::jsonb;

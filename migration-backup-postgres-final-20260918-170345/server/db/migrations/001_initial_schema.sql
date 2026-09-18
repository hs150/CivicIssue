CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    name VARCHAR(120) NOT NULL,

    email VARCHAR(255) UNIQUE NOT NULL,

    password_hash TEXT NOT NULL,

    role VARCHAR(30) NOT NULL DEFAULT 'citizen'
        CHECK (role IN ('citizen','officer','admin')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS issues (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    issue_code VARCHAR(50) UNIQUE NOT NULL,

    title VARCHAR(200) NOT NULL,

    description TEXT NOT NULL,

    category VARCHAR(80) NOT NULL,

    department VARCHAR(120),

    image_url TEXT,

    latitude DOUBLE PRECISION NOT NULL,

    longitude DOUBLE PRECISION NOT NULL,

    address TEXT,

    reported_by UUID NOT NULL
        REFERENCES users(id),

    assigned_to UUID
        REFERENCES users(id),

    status VARCHAR(40) NOT NULL DEFAULT 'NEW',

    phase VARCHAR(40) NOT NULL DEFAULT 'NEW',

    priority VARCHAR(30) NOT NULL DEFAULT 'MEDIUM',

    priority_score INTEGER NOT NULL DEFAULT 50,

    upvotes INTEGER NOT NULL DEFAULT 0,

    resolution_note TEXT,

    resolved_at TIMESTAMPTZ,

    conditions JSONB NOT NULL DEFAULT '{}'::jsonb,

    ai_analysis JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS issue_upvotes (

    issue_id UUID NOT NULL
        REFERENCES issues(id)
        ON DELETE CASCADE,

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY(issue_id, user_id)
);

CREATE TABLE IF NOT EXISTS comments (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    issue_id UUID NOT NULL
        REFERENCES issues(id)
        ON DELETE CASCADE,

    user_id UUID NOT NULL
        REFERENCES users(id),

    text TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS status_history (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    issue_id UUID NOT NULL
        REFERENCES issues(id)
        ON DELETE CASCADE,

    status VARCHAR(40) NOT NULL,

    phase VARCHAR(40) NOT NULL,

    changed_by UUID NOT NULL
        REFERENCES users(id),

    remarks TEXT,

    conditions JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_issues_phase
    ON issues(phase);

CREATE INDEX IF NOT EXISTS idx_issues_status
    ON issues(status);

CREATE INDEX IF NOT EXISTS idx_issues_priority
    ON issues(priority_score DESC);

CREATE INDEX IF NOT EXISTS idx_issues_reported_by
    ON issues(reported_by);

CREATE INDEX IF NOT EXISTS idx_issues_assigned_to
    ON issues(assigned_to);

CREATE INDEX IF NOT EXISTS idx_comments_issue
    ON comments(issue_id);

CREATE INDEX IF NOT EXISTS idx_history_issue
    ON status_history(issue_id);

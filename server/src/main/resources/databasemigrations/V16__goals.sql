
CREATE TABLE goal(
    id UUID PRIMARY KEY,
    domain_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL,
    path TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(domain_id, name)
)
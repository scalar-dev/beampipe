
CREATE TABLE slack_subscription(
    id UUID PRIMARY KEY,
    domain_id UUID NOT NULL,
    event_type TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    team_id TEXT NOT NULL
);
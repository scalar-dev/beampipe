CREATE TABLE IF NOT EXISTS event(
    id UUID NOT NULL,
    type VARCHAR(64) NOT NULL,
    domain VARCHAR(1024) NOT NULL,
    path VARCHAR(1024) NOT NULL,
    referrer VARCHAR(1024) NOT NULL,
    source VARCHAR(1024),
    user_agent VARCHAR(1024) NOT NULL,
    user_id BIGINT NOT NULL,
    city VARCHAR(1024),
    country VARCHAR(1024),
    screen_width INTEGER NOT NULL,
    device VARCHAR(64) NOT NULL,
    time TIMESTAMPTZ NOT NULL,
    data JSONB,
    PRIMARY KEY(id, time)
);
SELECT * FROM create_hypertable('event', 'time');


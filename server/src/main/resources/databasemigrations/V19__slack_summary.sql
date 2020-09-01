
ALTER TABLE slack_subscription
ALTER COLUMN event_type DROP NOT NULL,
ADD COLUMN subscription_type TEXT,
ADD COLUMN subscription_cron TEXT,
ADD COLUMN last_delivery_time TIMESTAMPTZ;
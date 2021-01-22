
CREATE TABLE reset_token(
    id UUID,
    account_id UUID REFERENCES account,
    token TEXT,
    created_at TIMESTAMPTZ
);
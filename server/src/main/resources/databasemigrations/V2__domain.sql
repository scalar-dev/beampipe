
CREATE TABLE account(
    id UUID PRIMARY KEY,
    username TEXT NOT NULL
);

CREATE TABLE domain(
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL,
    public BOOLEAN NOT NULL,
    domain TEXT NOT NULL
);
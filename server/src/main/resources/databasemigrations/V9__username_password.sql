
ALTER TABLE account
ADD COLUMN salt TEXT,
ADD COLUMN password TEXT;
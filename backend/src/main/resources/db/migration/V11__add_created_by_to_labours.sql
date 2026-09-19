ALTER TABLE labours ADD COLUMN created_by BIGINT NULL;
CREATE INDEX IF NOT EXISTS idx_labour_created_by ON labours (created_by);

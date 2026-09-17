ALTER TABLE labours ADD COLUMN created_by BIGINT NULL;
ALTER TABLE labours ADD INDEX idx_labour_created_by (created_by);

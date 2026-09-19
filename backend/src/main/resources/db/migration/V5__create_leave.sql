CREATE TABLE IF NOT EXISTS leave_request (
    id BIGSERIAL PRIMARY KEY,
    labour_id BIGINT NOT NULL,
    leave_type VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    approved_by BIGINT,
    approved_at TIMESTAMP,
    created_at TIMESTAMP
);
CREATE INDEX idx_leave_labour ON leave_request (labour_id);
CREATE INDEX idx_leave_status ON leave_request (status);

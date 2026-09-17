CREATE TABLE IF NOT EXISTS attendance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    labour_id BIGINT NOT NULL,
    attendance_date DATE NOT NULL,
    check_in TIME,
    check_out TIME,
    status VARCHAR(20) NOT NULL DEFAULT 'PRESENT',
    working_hours DECIMAL(5, 2),
    overtime_hours DECIMAL(5, 2),
    remarks VARCHAR(500),
    created_at DATETIME,
    updated_at DATETIME,
    CONSTRAINT uk_attendance_labour_date UNIQUE (labour_id, attendance_date)
);
CREATE INDEX idx_att_labour ON attendance (labour_id);
CREATE INDEX idx_att_date ON attendance (attendance_date);

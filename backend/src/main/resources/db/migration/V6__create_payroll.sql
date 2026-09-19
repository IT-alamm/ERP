CREATE TABLE IF NOT EXISTS payroll (
    id BIGSERIAL PRIMARY KEY,
    labour_id BIGINT NOT NULL,
    pay_period VARCHAR(7) NOT NULL,
    total_days INT,
    present_days INT,
    absent_days INT,
    leave_days INT,
    overtime_hours DECIMAL(6, 2),
    basic_amount DECIMAL(12, 2),
    overtime_amount DECIMAL(12, 2),
    bonus DECIMAL(12, 2),
    deduction DECIMAL(12, 2),
    gross_salary DECIMAL(12, 2),
    net_salary DECIMAL(12, 2),
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    generated_at TIMESTAMP,
    paid_at TIMESTAMP,
    created_at TIMESTAMP,
    CONSTRAINT uk_payroll_labour_period UNIQUE (labour_id, pay_period)
);
CREATE INDEX idx_payroll_labour ON payroll (labour_id);
CREATE INDEX idx_payroll_period ON payroll (pay_period);

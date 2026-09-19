CREATE TABLE IF NOT EXISTS expenses (
    id BIGSERIAL PRIMARY KEY,
    labour_id BIGINT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    expense_date DATE NOT NULL,
    remarks VARCHAR(500),
    created_at TIMESTAMP,
    CONSTRAINT fk_expense_labour FOREIGN KEY (labour_id) REFERENCES labours (id) ON DELETE CASCADE
);
CREATE INDEX idx_expense_labour ON expenses (labour_id);
CREATE INDEX idx_expense_date ON expenses (expense_date);

-- New permissions (admin ko neeche wali query se auto-assign)
INSERT INTO permissions (name, description) VALUES
('EXPENSE_VIEW', 'View expenses'),
('EXPENSE_ADD', 'Add expense')
ON CONFLICT (name) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.name = 'ROLE_ADMIN'
ON CONFLICT DO NOTHING;

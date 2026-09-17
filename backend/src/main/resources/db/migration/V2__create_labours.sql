-- Assign permissions to roles (idempotent via INSERT IGNORE)
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.name = 'ROLE_ADMIN';

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.name IN ('LABOUR_VIEW')
WHERE r.name = 'ROLE_LABOUR';

CREATE TABLE IF NOT EXISTS labours (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE,
    employee_code VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(60) NOT NULL,
    last_name VARCHAR(60),
    phone VARCHAR(15),
    date_of_birth DATE,
    gender VARCHAR(20),
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    joining_date DATE,
    designation VARCHAR(100),
    department VARCHAR(100),
    daily_wage DECIMAL(10, 2),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME,
    updated_at DATETIME,
    CONSTRAINT fk_labour_user FOREIGN KEY (user_id) REFERENCES users (id)
);
CREATE INDEX idx_labour_emp_code ON labours (employee_code);
CREATE INDEX idx_labour_phone ON labours (phone);
CREATE INDEX idx_labour_status ON labours (status);

CREATE TABLE IF NOT EXISTS permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(60) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at DATETIME
);

CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(40) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at DATETIME
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES roles (id),
    CONSTRAINT fk_rp_perm FOREIGN KEY (permission_id) REFERENCES permissions (id)
);

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(60) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id BIGINT NOT NULL,
    enabled BIT(1) NOT NULL DEFAULT 1,
    last_login DATETIME,
    created_at DATETIME,
    updated_at DATETIME,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles (id)
);
CREATE INDEX idx_users_username ON users (username);
CREATE INDEX idx_users_email ON users (email);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(500) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    expiry_date DATETIME NOT NULL,
    revoked BIT(1) NOT NULL DEFAULT 0,
    CONSTRAINT fk_rt_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Seed permissions
INSERT INTO permissions (name, description) VALUES
('LABOUR_VIEW', 'View labours'),
('LABOUR_CREATE', 'Create labour'),
('LABOUR_UPDATE', 'Update labour'),
('LABOUR_DELETE', 'Delete/deactivate labour'),
('ATTENDANCE_VIEW', 'View attendance'),
('ATTENDANCE_MARK', 'Mark attendance'),
('PAYROLL_VIEW', 'View payroll'),
('PAYROLL_GENERATE', 'Generate payroll'),
('LEAVE_APPROVE', 'Approve leaves'),
('PROJECT_MANAGE', 'Manage projects'),
('REPORT_VIEW', 'View reports and audit')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Seed roles
INSERT INTO roles (name, description) VALUES
('ROLE_ADMIN', 'Administrator'),
('ROLE_LABOUR', 'Labour worker')
ON DUPLICATE KEY UPDATE name = VALUES(name);

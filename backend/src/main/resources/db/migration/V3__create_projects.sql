CREATE TABLE IF NOT EXISTS projects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    client_name VARCHAR(255),
    location VARCHAR(255),
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'PLANNED',
    created_at DATETIME,
    updated_at DATETIME
);

CREATE TABLE IF NOT EXISTS labour_project (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    labour_id BIGINT NOT NULL,
    project_id BIGINT NOT NULL,
    assigned_date DATE,
    released_date DATE,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at DATETIME
);
CREATE INDEX idx_lp_labour ON labour_project (labour_id);
CREATE INDEX idx_lp_project ON labour_project (project_id);

-- Document metadata only. Actual file local disk me (./uploads). S3/MinIO baad me.
CREATE TABLE IF NOT EXISTS labour_documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    labour_id BIGINT NOT NULL,
    document_type VARCHAR(20) NOT NULL,
    file_name VARCHAR(255),
    storage_key VARCHAR(500),
    file_size BIGINT,
    mime_type VARCHAR(100),
    uploaded_at DATETIME
);
CREATE INDEX idx_doc_labour ON labour_documents (labour_id);

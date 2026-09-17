-- DB notifications only. Email/SMS/WhatsApp baad me.
CREATE TABLE IF NOT EXISTS notification (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    title VARCHAR(255),
    message TEXT,
    type VARCHAR(50),
    is_read BIT(1) NOT NULL DEFAULT 0,
    created_at DATETIME
);
CREATE INDEX idx_notif_user ON notification (user_id);

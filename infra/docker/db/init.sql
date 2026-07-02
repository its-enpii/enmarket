-- ───── MySQL init untuk enmarket ─────
-- Otomatis dijalankan oleh docker-entrypoint-initdb.d saat container pertama kali start
-- Untuk memastikan database & user siap sebelum aplikasi connect.

CREATE DATABASE IF NOT EXISTS enmarket CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'enmarket'@'%' IDENTIFIED BY 'secret';
GRANT ALL PRIVILEGES ON enmarket.* TO 'enmarket'@'%';
FLUSH PRIVILEGES;
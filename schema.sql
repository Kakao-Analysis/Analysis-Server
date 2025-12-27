CREATE TABLE IF NOT EXISTS `option_items` (
  `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `category` ENUM('EMPATHY', 'SELECT1', 'SELECT2') NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `label` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_category_code` (`category`, `code`),
  INDEX `idx_category_sort` (`category`, `sort_order`, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `analyses` (
  `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `session_uuid` CHAR(36) NOT NULL,
  `user_name` VARCHAR(50) NOT NULL,
  `partner_name` VARCHAR(50) NOT NULL,
  `question_text` VARCHAR(255) NOT NULL,
  `empathy_option_id` BIGINT NULL,
  `select1_option_id` BIGINT NULL,
  `select2_option_id` BIGINT NULL,
  `status` ENUM('CREATED','FILE_UPLOADED','PROCESSING','DONE','FAILED') NOT NULL DEFAULT 'CREATED',
  `is_paid` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_session_uuid` (`session_uuid`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`empathy_option_id`) REFERENCES `option_items`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`select1_option_id`) REFERENCES `option_items`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`select2_option_id`) REFERENCES `option_items`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `analysis_details` (
  `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `analysis_id` BIGINT NOT NULL,
  `summary_text` TEXT NOT NULL,
  `detail_json` JSON NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_analysis_id` (`analysis_id`),
  FOREIGN KEY (`analysis_id`) REFERENCES `analyses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `source_files` (
  `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `analysis_id` BIGINT NOT NULL,
  `original_filename` VARCHAR(255) NOT NULL,
  `stored_filename` VARCHAR(255) NOT NULL,
  `mime_type` VARCHAR(100) NOT NULL,
  `file_size` INT NOT NULL,
  `uploaded_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `parsed` TINYINT(1) NOT NULL DEFAULT 0,
  `parsed_message_count` INT NULL,
  `error_message` TEXT NULL,
  INDEX `idx_analysis_id` (`analysis_id`),
  INDEX `idx_parsed` (`parsed`),
  FOREIGN KEY (`analysis_id`) REFERENCES `analyses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `payments` (
  `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `analysis_id` BIGINT NOT NULL,
  `amount` INT NOT NULL,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'KRW',
  `provider` VARCHAR(50) NOT NULL,
  `transaction_id` VARCHAR(100) NOT NULL,
  `status` ENUM('PENDING','SUCCESS','FAILED') NOT NULL DEFAULT 'PENDING',
  `provider_raw_response` JSON NULL,
  `paid_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_analysis_id` (`analysis_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_transaction_id` (`transaction_id`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`analysis_id`) REFERENCES `analyses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;





-- SIMME - MySQL 8.0+
-- Execute este arquivo uma vez no banco configurado em DATABASE_URL.

CREATE TABLE IF NOT EXISTS system_settings (
  id TINYINT PRIMARY KEY DEFAULT 1,
  admin_password_hash TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT system_settings_single_row CHECK (id = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS materials (
  id CHAR(36) PRIMARY KEY,
  type VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NULL,
  category VARCHAR(100) NULL,
  code VARCHAR(100) NULL UNIQUE,
  description TEXT NULL,
  available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT materials_type CHECK (type IN ('livro', 'instrumento', 'jogo')),
  CONSTRAINT materials_book_category CHECK ((type = 'livro' AND category IS NOT NULL) OR type <> 'livro')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS loans (
  id CHAR(36) PRIMARY KEY,
  material_id CHAR(36) NOT NULL,
  student_name VARCHAR(255) NOT NULL,
  course VARCHAR(120) NOT NULL,
  class_group VARCHAR(30) NOT NULL,
  school_year VARCHAR(30) NOT NULL,
  loaned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  due_at TIMESTAMP NULL,
  returned_at TIMESTAMP NULL,
  returned BOOLEAN NOT NULL DEFAULT FALSE,
  reading_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  review_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT loans_material_fk FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS reviews (
  id CHAR(36) PRIMARY KEY,
  loan_id CHAR(36) NULL,
  student_name VARCHAR(255) NOT NULL,
  course VARCHAR(120) NOT NULL,
  class_group VARCHAR(30) NOT NULL,
  school_year VARCHAR(30) NOT NULL,
  book_title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT reviews_loan_fk FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE SET NULL,
  CONSTRAINT reviews_one_per_loan UNIQUE (loan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX loans_active_due_at ON loans(returned, due_at);
CREATE INDEX loans_ranking ON loans(loaned_at, review_confirmed);
CREATE INDEX materials_catalog ON materials(type, category, available);

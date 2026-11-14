-- GP Tanakpur portal schema (PostgreSQL). Idempotent: safe to run many times.
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('student','faculty','admin')),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  mobile TEXT,
  roll_number TEXT UNIQUE,
  department TEXT,
  assigned_subjects TEXT[] NOT NULL DEFAULT '{}',
  password_hash TEXT NOT NULL,
  must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
  mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  sms_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  avatar_url TEXT NOT NULL DEFAULT '',
  token_version INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS users_mobile_idx ON users (mobile);

CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  roll_number TEXT UNIQUE NOT NULL,
  branch TEXT NOT NULL,
  current_year TEXT NOT NULL,
  batch_year INT NOT NULL,
  status TEXT NOT NULL,
  aadhar_encrypted TEXT NOT NULL DEFAULT '',
  aadhar_masked TEXT NOT NULL DEFAULT '',
  profile JSONB NOT NULL,          -- StudentProfile without aadhaar number / passwords
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS students_class_idx ON students (current_year, branch, batch_year);

CREATE TABLE IF NOT EXISTS assignments (
  id TEXT PRIMARY KEY,
  branch TEXT NOT NULL,
  target_year TEXT NOT NULL,
  subject_code TEXT NOT NULL,
  deadline TIMESTAMPTZ,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS doubts (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  target_user_id TEXT,              -- NULL = broadcast to everyone
  data JSONB NOT NULL,
  read_by TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notifications_target_idx ON notifications (target_user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS otp_codes (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS login_attempts (
  key TEXT PRIMARY KEY,
  fails INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT,
  user_name TEXT,
  user_role TEXT,
  action TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL,
  details TEXT NOT NULL DEFAULT '',
  ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Placement Tracker: resumes, placement Q&A attempts, AI mock interviews, faculty notices
CREATE TABLE IF NOT EXISTS tracker_items (
  id          TEXT PRIMARY KEY,
  kind        TEXT NOT NULL,          -- resume | qna | interview | notice
  owner_id    TEXT,                   -- student user id (NULL for notices)
  data        JSONB NOT NULL,
  file        BYTEA,                  -- uploaded resume file
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS tracker_items_kind_idx ON tracker_items (kind, owner_id);

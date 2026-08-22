/*
# Limitify: Intent-Based Smart Screen-Time Control Schema

1. Purpose
   - Stores monitored applications, usage sessions, and block events for the Limitify app.
   - Single-tenant (no auth) — the app is a personal digital wellbeing assistant.
   - All data is local to the device/user and not shared externally.

2. New Tables
   - monitored_apps: apps the user has selected to monitor with intended usage limits
     - id (uuid PK)
     - package_name (text, unique identifier for the app)
     - app_name (text, display name)
     - app_icon (text, emoji or icon identifier for display)
     - app_category (text, e.g. "Social", "Games", "Entertainment")
     - limit_minutes (int, intended usage duration)
     - enabled (bool, whether monitoring is active)
     - created_at (timestamptz)
     - updated_at (timestamptz)
   - usage_sessions: individual usage sessions for monitored apps
     - id (uuid PK)
     - package_name (text, FK to monitored_apps)
     - session_date (date, the day the session occurred)
     - start_time (timestamptz)
     - end_time (timestamptz)
     - duration_minutes (int, how long the session lasted)
     - created_at (timestamptz)
   - block_events: records of when an app was blocked due to exceeding limits
     - id (uuid PK)
     - package_name (text, FK to monitored_apps)
     - block_date (date)
     - limit_minutes (int, the configured limit at time of block)
     - actual_usage_minutes (int, actual usage when blocked)
     - created_at (timestamptz)

3. Security
   - RLS enabled on all tables.
   - Single-tenant no-auth app: policies use TO anon, authenticated with USING(true) / WITH CHECK(true)
     because all data is intentionally shared/local to the device.
*/

CREATE TABLE IF NOT EXISTS monitored_apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_name text UNIQUE NOT NULL,
  app_name text NOT NULL,
  app_icon text NOT NULL DEFAULT '📱',
  app_category text NOT NULL DEFAULT 'Other',
  limit_minutes int NOT NULL DEFAULT 30,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE monitored_apps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_monitored_apps" ON monitored_apps;
CREATE POLICY "anon_select_monitored_apps" ON monitored_apps FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_monitored_apps" ON monitored_apps;
CREATE POLICY "anon_insert_monitored_apps" ON monitored_apps FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_monitored_apps" ON monitored_apps;
CREATE POLICY "anon_update_monitored_apps" ON monitored_apps FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_monitored_apps" ON monitored_apps;
CREATE POLICY "anon_delete_monitored_apps" ON monitored_apps FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS usage_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_name text NOT NULL REFERENCES monitored_apps(package_name) ON DELETE CASCADE,
  session_date date NOT NULL DEFAULT CURRENT_DATE,
  start_time timestamptz NOT NULL DEFAULT now(),
  end_time timestamptz,
  duration_minutes int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE usage_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_usage_sessions" ON usage_sessions;
CREATE POLICY "anon_select_usage_sessions" ON usage_sessions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_usage_sessions" ON usage_sessions;
CREATE POLICY "anon_insert_usage_sessions" ON usage_sessions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_usage_sessions" ON usage_sessions;
CREATE POLICY "anon_update_usage_sessions" ON usage_sessions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_usage_sessions" ON usage_sessions;
CREATE POLICY "anon_delete_usage_sessions" ON usage_sessions FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS block_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_name text NOT NULL REFERENCES monitored_apps(package_name) ON DELETE CASCADE,
  block_date date NOT NULL DEFAULT CURRENT_DATE,
  limit_minutes int NOT NULL,
  actual_usage_minutes int NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE block_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_block_events" ON block_events;
CREATE POLICY "anon_select_block_events" ON block_events FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_block_events" ON block_events;
CREATE POLICY "anon_insert_block_events" ON block_events FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_block_events" ON block_events;
CREATE POLICY "anon_delete_block_events" ON block_events FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_usage_sessions_package_date ON usage_sessions(package_name, session_date);
CREATE INDEX IF NOT EXISTS idx_block_events_package_date ON block_events(package_name, block_date);
CREATE INDEX IF NOT EXISTS idx_usage_sessions_date ON usage_sessions(session_date);

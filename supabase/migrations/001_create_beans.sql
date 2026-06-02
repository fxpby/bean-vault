-- BeanVault: beans table for Supabase
-- Run this in Supabase SQL Editor or via supabase migration

CREATE TABLE IF NOT EXISTS beans (
  id            UUID PRIMARY KEY,
  user_id       UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  category      TEXT NOT NULL DEFAULT 'pourover',
  status        TEXT NOT NULL DEFAULT 'shelf',
  country       TEXT NOT NULL DEFAULT '',
  country_code  TEXT,
  estate        TEXT DEFAULT '',
  variety       TEXT DEFAULT '',
  process       TEXT DEFAULT 'washed',
  roast_level   TEXT DEFAULT 'medium',
  flavor_notes  TEXT[] DEFAULT '{}',
  price_per_gram NUMERIC(10, 4) DEFAULT 0,
  resting_days  INTEGER NOT NULL DEFAULT 14,
  production_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_deleted    BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast user-specific queries
CREATE INDEX IF NOT EXISTS idx_beans_user_id ON beans(user_id);
CREATE INDEX IF NOT EXISTS idx_beans_updated_at ON beans(updated_at DESC);

-- RLS: enable
ALTER TABLE beans ENABLE ROW LEVEL SECURITY;

-- Policy: users can only see their own beans
CREATE POLICY "Users can view own beans"
  ON beans FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: users can insert their own beans
CREATE POLICY "Users can insert own beans"
  ON beans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: users can update their own beans
CREATE POLICY "Users can update own beans"
  ON beans FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: users can delete their own beans
CREATE POLICY "Users can delete own beans"
  ON beans FOR DELETE
  USING (auth.uid() = user_id);
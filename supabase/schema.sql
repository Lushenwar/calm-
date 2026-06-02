-- ============================================================
-- CALM — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- pgvector for AI embeddings (future Ask AI feature)
CREATE EXTENSION IF NOT EXISTS vector;

-- ── Series ──────────────────────────────────────────────────
-- Populated when a user first adds a title to their library.
-- Stores AniList metadata so we don't re-fetch on every page load.
CREATE TABLE IF NOT EXISTS series (
  id             TEXT PRIMARY KEY,         -- AniList numeric ID as string
  anilist_id     INTEGER UNIQUE NOT NULL,
  title          TEXT NOT NULL,
  cover_image    TEXT,
  synopsis       TEXT,
  genres         TEXT[]  DEFAULT '{}',
  themes         TEXT[]  DEFAULT '{}',
  status         TEXT    DEFAULT 'ongoing',
  chapters       INTEGER DEFAULT 0,
  author         TEXT,
  artist         TEXT,
  year           INTEGER,
  rating         DECIMAL(3,1),
  mu_rating      DECIMAL(4,2),             -- MangaUpdates bayesian rating
  embedding      vector(1536),             -- OpenAI text-embedding-3-small
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── Library ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS library (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  series_id  TEXT REFERENCES series(id)    ON DELETE CASCADE NOT NULL,
  status     TEXT NOT NULL CHECK (status IN (
               'reading', 'completed', 'on-hold', 'dropped', 'plan-to-read'
             )),
  progress   INTEGER DEFAULT 0 CHECK (progress >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, series_id)
);

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE series  ENABLE ROW LEVEL SECURITY;
ALTER TABLE library ENABLE ROW LEVEL SECURITY;

-- Series: anyone can read; authenticated users can upsert (for sync)
CREATE POLICY "series_select_all"
  ON series FOR SELECT USING (true);

CREATE POLICY "series_insert_auth"
  ON series FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "series_update_auth"
  ON series FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Library: users own their rows
CREATE POLICY "library_select_own"
  ON library FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "library_insert_own"
  ON library FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "library_update_own"
  ON library FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "library_delete_own"
  ON library FOR DELETE USING (auth.uid() = user_id);

-- ── updated_at trigger ────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER series_updated_at
  BEFORE UPDATE ON series
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER library_updated_at
  BEFORE UPDATE ON library
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

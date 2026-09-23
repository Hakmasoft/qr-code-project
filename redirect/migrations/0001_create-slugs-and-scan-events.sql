-- Migration number: 0001 	 2026-09-23T09:02:25.176Z

-- Table: slugs
-- Stores the mapping between printed short codes and their current destinations.

CREATE TABLE IF NOT EXISTS slugs (
  slug TEXT PRIMARY KEY,
  destination TEXT NOT NULL,
  surface_source TEXT NOT NULL,
  topic TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Table: scan_events
-- One row per scan. Append-only.

CREATE TABLE IF NOT EXISTS scan_events (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  device_type TEXT,
  ip_hash TEXT,
  user_agent TEXT,
  FOREIGN KEY (slug) REFERENCES slugs(slug)
);

-- Indexes

CREATE INDEX IF NOT EXISTS idx_scan_events_slug_timestamp
  ON scan_events(slug, timestamp);

CREATE INDEX IF NOT EXISTS idx_scan_events_timestamp
  ON scan_events(timestamp);

CREATE INDEX IF NOT EXISTS idx_slugs_active
  ON slugs(active);

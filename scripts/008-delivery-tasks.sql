CREATE TABLE IF NOT EXISTS delivery_tasks (
  id                TEXT PRIMARY KEY,
  delivery_id       TEXT NOT NULL,
  type              TEXT NOT NULL DEFAULT 'fixed',
  key               TEXT NOT NULL,
  title             TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pendente',
  assignee_id       TEXT,
  quantity          INTEGER DEFAULT 1,
  enabled           BOOLEAN DEFAULT TRUE,
  notes             TEXT,
  position          INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS delivery_subtasks (
  id            TEXT PRIMARY KEY,
  delivery_id   TEXT NOT NULL,
  parent_key    TEXT NOT NULL,
  key           TEXT NOT NULL,
  title         TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pendente',
  position      INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

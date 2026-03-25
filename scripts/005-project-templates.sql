CREATE TABLE IF NOT EXISTS project_templates (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  category    TEXT DEFAULT 'geral',
  color       TEXT DEFAULT '#EAB308',
  icon        TEXT DEFAULT 'layout',
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_template_tasks (
  id           TEXT PRIMARY KEY,
  template_id  TEXT NOT NULL REFERENCES project_templates(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  assignee_id  TEXT,
  priority     TEXT DEFAULT 'media',
  due_days     INTEGER DEFAULT 0,
  position     INTEGER DEFAULT 0,
  deliverable  TEXT,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

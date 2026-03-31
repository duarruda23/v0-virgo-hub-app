-- Expande a tabela deliveries existente para suportar o novo modelo por cliente/mês
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS client_id TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS month TEXT; -- ex: "2025-06"

-- Tabelas de subtarefas de entrega já criadas em 008-delivery-tasks.sql
-- Garante que existem
CREATE TABLE IF NOT EXISTS delivery_tasks (
  id          TEXT PRIMARY KEY DEFAULT 'dt_' || gen_random_uuid(),
  delivery_id TEXT NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  type        TEXT NOT NULL DEFAULT 'fixed',
  key         TEXT NOT NULL,
  title       TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pendente',
  assignee_id TEXT,
  quantity    INTEGER DEFAULT 1,
  enabled     BOOLEAN DEFAULT TRUE,
  notes       TEXT,
  position    INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS delivery_subtasks (
  id          TEXT PRIMARY KEY DEFAULT 'dst_' || gen_random_uuid(),
  delivery_id TEXT NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  parent_key  TEXT NOT NULL,
  key         TEXT NOT NULL,
  title       TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pendente',
  position    INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

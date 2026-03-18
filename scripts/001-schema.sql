-- ============================================================
-- Virgo Hub — Schema completo
-- ============================================================

-- Extensão para UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Users ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  password    TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'collaborator' CHECK (role IN ('admin','leader','collaborator')),
  avatar      TEXT,
  department  TEXT,
  position    TEXT,
  phone       TEXT,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Clients ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  company       TEXT,
  cnpj          TEXT,
  website       TEXT,
  status        TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo','inativo','prospecto','churned')),
  tier          TEXT NOT NULL DEFAULT 'basic' CHECK (tier IN ('basic','standard','premium','enterprise')),
  segment       TEXT,
  responsible_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  address       TEXT,
  city          TEXT,
  notes         TEXT,
  tags          TEXT[] NOT NULL DEFAULT '{}',
  mrr           NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Leads ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name           TEXT NOT NULL,
  email          TEXT NOT NULL,
  phone          TEXT,
  company        TEXT,
  status         TEXT NOT NULL DEFAULT 'novo',
  source         TEXT NOT NULL DEFAULT 'outros' CHECK (source IN ('indicacao','site','redes_sociais','email','evento','outros')),
  value          NUMERIC(12,2) NOT NULL DEFAULT 0,
  responsible_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  notes          TEXT,
  tags           TEXT[] NOT NULL DEFAULT '{}',
  next_follow_up TIMESTAMPTZ,
  lost_reason    TEXT,
  converted_client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Projects ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name         TEXT NOT NULL,
  description  TEXT,
  client_id    TEXT REFERENCES clients(id) ON DELETE SET NULL,
  status       TEXT NOT NULL DEFAULT 'briefing' CHECK (status IN ('briefing','planejamento','em_execucao','revisao','aprovacao','concluido','pausado','cancelado')),
  priority     TEXT NOT NULL DEFAULT 'media' CHECK (priority IN ('baixa','media','alta','urgente')),
  manager_id   TEXT REFERENCES users(id) ON DELETE SET NULL,
  team_ids     TEXT[] NOT NULL DEFAULT '{}',
  budget       NUMERIC(12,2),
  start_date   DATE NOT NULL,
  due_date     DATE NOT NULL,
  completed_at TIMESTAMPTZ,
  tags         TEXT[] NOT NULL DEFAULT '{}',
  progress     INT NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Deliveries ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deliveries (
  id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title          TEXT NOT NULL,
  description    TEXT,
  project_id     TEXT REFERENCES projects(id) ON DELETE CASCADE,
  type           TEXT NOT NULL DEFAULT 'outro' CHECK (type IN ('post_feed','post_stories','reels','video','banner','copy','relatorio','landing_page','outro')),
  status         TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','em_producao','em_revisao','aprovado','entregue','cancelado')),
  responsible_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  due_date       DATE NOT NULL,
  delivered_at   TIMESTAMPTZ,
  file_url       TEXT,
  review_notes   TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Tasks ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title        TEXT NOT NULL,
  description  TEXT,
  project_id   TEXT REFERENCES projects(id) ON DELETE SET NULL,
  delivery_id  TEXT REFERENCES deliveries(id) ON DELETE SET NULL,
  assignee_id  TEXT REFERENCES users(id) ON DELETE SET NULL,
  creator_id   TEXT REFERENCES users(id) ON DELETE SET NULL,
  status       TEXT NOT NULL DEFAULT 'a_fazer' CHECK (status IN ('backlog','a_fazer','em_progresso','em_revisao','concluida')),
  priority     TEXT NOT NULL DEFAULT 'media' CHECK (priority IN ('baixa','media','alta','urgente')),
  due_date     DATE,
  completed_at TIMESTAMPTZ,
  tags         TEXT[] NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Products ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name          TEXT NOT NULL,
  description   TEXT,
  category      TEXT NOT NULL DEFAULT 'outro' CHECK (category IN ('gestao_social','trafego_pago','seo','design','video','consultoria','outro')),
  price         NUMERIC(12,2) NOT NULL DEFAULT 0,
  billing_cycle TEXT NOT NULL DEFAULT 'mensal' CHECK (billing_cycle IN ('mensal','trimestral','semestral','anual','unico')),
  active        BOOLEAN NOT NULL DEFAULT true,
  deliverables  TEXT[] NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Pipeline Stages ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pipeline_stages (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  label      TEXT NOT NULL,
  color      TEXT NOT NULL DEFAULT '#3b82f6',
  "order"    INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Etapas padrão
INSERT INTO pipeline_stages (id, label, color, "order") VALUES
  ('novo',        'Novo',        '#3b82f6', 0),
  ('em_contato',  'Em Contato',  '#eab308', 1),
  ('proposta',    'Proposta',    '#a855f7', 2),
  ('negociacao',  'Negociação',  '#f97316', 3),
  ('ganho',       'Ganho',       '#22c55e', 4),
  ('perdido',     'Perdido',     '#ef4444', 5)
ON CONFLICT (id) DO NOTHING;

-- ─── Automations ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stage_automations (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  stage_id      TEXT NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('webhook','task')),
  active        BOOLEAN NOT NULL DEFAULT true,
  -- webhook
  webhook_url   TEXT,
  -- task
  title_template TEXT,
  priority      TEXT CHECK (priority IN ('baixa','media','alta','urgente')),
  assignee_id   TEXT REFERENCES users(id) ON DELETE SET NULL,
  due_value     INT,
  due_unit      TEXT CHECK (due_unit IN ('segundos','minutos','horas','dias','meses')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Notifications ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id    TEXT REFERENCES users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  type       TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info','warning','success','error')),
  read       BOOLEAN NOT NULL DEFAULT false,
  link       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

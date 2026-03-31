-- 010-pauta.sql — Tabelas do módulo Pauta

-- Meses/ciclos da pauta
CREATE TABLE IF NOT EXISTS pauta_months (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month INT NOT NULL,
  year INT NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(month, year)
);

-- Tipos de entrega
CREATE TABLE IF NOT EXISTS pauta_delivery_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT DEFAULT 'general', -- 'video','design','content','general'
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO pauta_delivery_types (name, category, sort_order) VALUES
  ('Planejamento',       'general', 1),
  ('Aprovação Planej.',  'general', 2),
  ('Marcação Gravação',  'general', 3),
  ('Gravação',           'video',   4),
  ('Upload no Drive',    'general', 5),
  ('Edição Vídeo 1',     'video',   6),
  ('Edição Vídeo 2',     'video',   7),
  ('Edição Vídeo 3',     'video',   8),
  ('Edição Vídeo 4',     'video',   9),
  ('Edição Vídeo 5',     'video',  10),
  ('Edição Vídeo 6',     'video',  11),
  ('Edição Vídeo 7',     'video',  12),
  ('Edição Vídeo 8',     'video',  13),
  ('Design Arte 1',      'design', 14),
  ('Design Arte 2',      'design', 15),
  ('Design Arte 3',      'design', 16),
  ('Design Arte 4',      'design', 17),
  ('Design Arte 5',      'design', 18),
  ('Design Arte 6',      'design', 19),
  ('Design Arte 7',      'design', 20),
  ('Design Arte 8',      'design', 21),
  ('Landing Page',       'design', 22),
  ('Revisão',            'general',23),
  ('Aprovação Final',    'general',24),
  ('Programação',        'content',25),
  ('Mês Finalizado',     'general',26)
ON CONFLICT (name) DO NOTHING;

-- Items da pauta (célula cliente x tipo entrega)
CREATE TABLE IF NOT EXISTS pauta_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pauta_month_id UUID NOT NULL REFERENCES pauta_months(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL,
  delivery_type_id UUID NOT NULL REFERENCES pauta_delivery_types(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  assigned_to TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pauta_month_id, client_id, delivery_type_id)
);

-- Configuração por cliente/mês (qty videos, designs, landing page)
CREATE TABLE IF NOT EXISTS pauta_client_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pauta_month_id UUID NOT NULL REFERENCES pauta_months(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL,
  qty_videos INT DEFAULT 0,
  qty_designs INT DEFAULT 0,
  has_landing_page BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pauta_month_id, client_id)
);

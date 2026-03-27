CREATE TABLE IF NOT EXISTS financial_entries (
  id           TEXT PRIMARY KEY,
  client_id    TEXT,                        -- vínculo com cliente (opcional)
  project_id   TEXT,                        -- vínculo com projeto (opcional)
  type         TEXT NOT NULL DEFAULT 'receita',  -- 'receita' | 'despesa'
  category     TEXT NOT NULL DEFAULT 'avulso',   -- 'mrr' | 'avulso' | 'bonus' | 'comissao' | 'ajuste' | 'desconto' | 'reembolso' | 'parcela'
  description  TEXT NOT NULL,
  amount       NUMERIC NOT NULL DEFAULT 0,
  status       TEXT NOT NULL DEFAULT 'pendente', -- 'pendente' | 'pago' | 'atrasado' | 'cancelado'
  due_date     DATE,
  paid_at      DATE,
  recurrent    BOOLEAN NOT NULL DEFAULT FALSE,
  notes        TEXT,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

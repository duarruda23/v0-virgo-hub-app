-- Adiciona campos fiscais à tabela leads para criação automática de clientes
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS cnpj                  TEXT,
  ADD COLUMN IF NOT EXISTS trade_name            TEXT,
  ADD COLUMN IF NOT EXISTS state_registration    TEXT,
  ADD COLUMN IF NOT EXISTS municipal_registration TEXT,
  ADD COLUMN IF NOT EXISTS tax_regime            TEXT,
  ADD COLUMN IF NOT EXISTS legal_nature          TEXT,
  ADD COLUMN IF NOT EXISTS founding_date         TEXT,
  ADD COLUMN IF NOT EXISTS converted_client_id   TEXT;

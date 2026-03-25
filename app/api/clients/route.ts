import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { generateId } from "@/lib/utils-crm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const rows = search
    ? await sql`SELECT * FROM clients WHERE name ILIKE ${"%" + search + "%"} OR company ILIKE ${"%" + search + "%"} ORDER BY created_at DESC LIMIT 5`
    : await sql`SELECT * FROM clients ORDER BY created_at DESC`;
  return NextResponse.json(rows.map(dbToClient));
}

// Converte qualquer string vazia/inválida para null em campos de data
export function toDateOrNull(val: unknown): string | null {
  if (!val || typeof val !== "string" || val.trim() === "") return null;
  return val.trim();
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  const id = generateId("c");
  const foundingDate = toDateOrNull(b.foundingDate);
  const rows = await sql`
    INSERT INTO clients (
      id, name, email, phone, company, cnpj, trade_name, state_registration,
      municipal_registration, tax_regime, legal_nature, founding_date,
      website, status, tier, segment, responsible_id, address, city, notes, tags, mrr
    ) VALUES (
      ${id}, ${b.name}, ${b.email}, ${b.phone ?? null}, ${b.company ?? null},
      ${b.cnpj ?? null}, ${b.tradeName ?? null}, ${b.stateRegistration ?? null},
      ${b.municipalRegistration ?? null}, ${b.taxRegime ?? null}, ${b.legalNature ?? null},
      ${foundingDate}, ${b.website ?? null},
      ${b.status ?? "ativo"}, ${b.tier ?? "standard"}, ${b.segment ?? null},
      ${b.responsibleId ?? null}, ${b.address ?? null}, ${b.city ?? null},
      ${b.notes ?? null}, ${b.tags ?? []}, ${b.mrr ?? 0}
    ) RETURNING *
  `;
  return NextResponse.json(dbToClient(rows[0]), { status: 201 });
}

export function dbToClient(r: Record<string, unknown>) {
  return {
    id: r.id, name: r.name, email: r.email, phone: r.phone,
    company: r.company, cnpj: r.cnpj,
    tradeName: r.trade_name, stateRegistration: r.state_registration,
    municipalRegistration: r.municipal_registration, taxRegime: r.tax_regime,
    legalNature: r.legal_nature, foundingDate: r.founding_date,
    website: r.website, status: r.status, tier: r.tier, segment: r.segment,
    responsibleId: r.responsible_id, address: r.address, city: r.city,
    notes: r.notes, tags: r.tags ?? [], mrr: Number(r.mrr),
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

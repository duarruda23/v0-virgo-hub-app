import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { generateId } from "@/lib/utils-crm";

export async function GET() {
  const rows = await sql`SELECT * FROM leads ORDER BY created_at DESC`;
  return NextResponse.json(rows.map(dbToLead));
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  const id = generateId("lead");
  const rows = await sql`
    INSERT INTO leads (
      id, name, email, phone, company,
      cnpj, trade_name, state_registration, municipal_registration,
      tax_regime, legal_nature, founding_date,
      status, source, value, responsible_id, notes, tags,
      next_follow_up, lost_reason, converted_client_id
    ) VALUES (
      ${id}, ${b.name}, ${b.email}, ${b.phone ?? null}, ${b.company ?? null},
      ${b.cnpj ?? null}, ${b.tradeName ?? null}, ${b.stateRegistration ?? null}, ${b.municipalRegistration ?? null},
      ${b.taxRegime ?? null}, ${b.legalNature ?? null}, ${b.foundingDate ?? null},
      ${b.status ?? "novo"}, ${b.source ?? "outros"}, ${b.value ?? 0},
      ${b.responsibleId ?? null}, ${b.notes ?? null}, ${b.tags ?? []},
      ${b.nextFollowUp ?? null}, ${b.lostReason ?? null}, ${b.convertedClientId ?? null}
    ) RETURNING *
  `;
  return NextResponse.json(dbToLead(rows[0]), { status: 201 });
}

export function dbToLead(r: Record<string, unknown>) {
  return {
    id: r.id, name: r.name, email: r.email, phone: r.phone, company: r.company,
    cnpj: r.cnpj, tradeName: r.trade_name,
    stateRegistration: r.state_registration, municipalRegistration: r.municipal_registration,
    taxRegime: r.tax_regime, legalNature: r.legal_nature, foundingDate: r.founding_date,
    status: r.status, source: r.source, value: Number(r.value),
    responsibleId: r.responsible_id, notes: r.notes, tags: r.tags ?? [],
    nextFollowUp: r.next_follow_up, lostReason: r.lost_reason,
    convertedClientId: r.converted_client_id,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

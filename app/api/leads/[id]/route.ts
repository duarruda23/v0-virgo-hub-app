import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { dbToLead } from "@/app/api/leads/route";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await req.json();
  const rows = await sql`
    UPDATE leads SET
      name                    = COALESCE(${b.name ?? null}, name),
      email                   = COALESCE(${b.email ?? null}, email),
      phone                   = COALESCE(${b.phone ?? null}, phone),
      company                 = COALESCE(${b.company ?? null}, company),
      cnpj                    = COALESCE(${b.cnpj ?? null}, cnpj),
      trade_name              = COALESCE(${b.tradeName ?? null}, trade_name),
      state_registration      = COALESCE(${b.stateRegistration ?? null}, state_registration),
      municipal_registration  = COALESCE(${b.municipalRegistration ?? null}, municipal_registration),
      tax_regime              = COALESCE(${b.taxRegime ?? null}, tax_regime),
      legal_nature            = COALESCE(${b.legalNature ?? null}, legal_nature),
      founding_date           = COALESCE(${b.foundingDate ?? null}, founding_date),
      status                  = COALESCE(${b.status ?? null}, status),
      source                  = COALESCE(${b.source ?? null}, source),
      value                   = COALESCE(${b.value ?? null}, value),
      responsible_id          = COALESCE(${b.responsibleId ?? null}, responsible_id),
      notes                   = COALESCE(${b.notes ?? null}, notes),
      tags                    = COALESCE(${b.tags ?? null}, tags),
      next_follow_up          = COALESCE(${b.nextFollowUp ?? null}, next_follow_up),
      lost_reason             = COALESCE(${b.lostReason ?? null}, lost_reason),
      converted_client_id     = COALESCE(${b.convertedClientId ?? null}, converted_client_id),
      updated_at              = NOW()
    WHERE id = ${id} RETURNING *
  `;
  if (!rows[0]) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(dbToLead(rows[0]));
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await sql`DELETE FROM leads WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}

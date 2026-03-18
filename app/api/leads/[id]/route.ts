import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await req.json();
  const rows = await sql`
    UPDATE leads SET
      name                = COALESCE(${b.name ?? null}, name),
      email               = COALESCE(${b.email ?? null}, email),
      phone               = COALESCE(${b.phone ?? null}, phone),
      company             = COALESCE(${b.company ?? null}, company),
      status              = COALESCE(${b.status ?? null}, status),
      source              = COALESCE(${b.source ?? null}, source),
      value               = COALESCE(${b.value ?? null}, value),
      responsible_id      = COALESCE(${b.responsibleId ?? null}, responsible_id),
      notes               = COALESCE(${b.notes ?? null}, notes),
      tags                = COALESCE(${b.tags ?? null}, tags),
      next_follow_up      = COALESCE(${b.nextFollowUp ?? null}, next_follow_up),
      lost_reason         = COALESCE(${b.lostReason ?? null}, lost_reason),
      converted_client_id = COALESCE(${b.convertedClientId ?? null}, converted_client_id),
      updated_at          = NOW()
    WHERE id = ${id} RETURNING *
  `;
  if (!rows[0]) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  const r = rows[0];
  return NextResponse.json({ id: r.id, name: r.name, email: r.email, phone: r.phone, company: r.company, status: r.status, source: r.source, value: Number(r.value), responsibleId: r.responsible_id, notes: r.notes, tags: r.tags ?? [], nextFollowUp: r.next_follow_up, lostReason: r.lost_reason, convertedClientId: r.converted_client_id, createdAt: r.created_at, updatedAt: r.updated_at });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await sql`DELETE FROM leads WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}

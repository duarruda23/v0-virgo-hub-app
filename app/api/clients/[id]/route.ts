import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await req.json();
  const rows = await sql`
    UPDATE clients SET
      name           = COALESCE(${b.name ?? null}, name),
      email          = COALESCE(${b.email ?? null}, email),
      phone          = COALESCE(${b.phone ?? null}, phone),
      company        = COALESCE(${b.company ?? null}, company),
      cnpj           = COALESCE(${b.cnpj ?? null}, cnpj),
      website        = COALESCE(${b.website ?? null}, website),
      status         = COALESCE(${b.status ?? null}, status),
      tier           = COALESCE(${b.tier ?? null}, tier),
      segment        = COALESCE(${b.segment ?? null}, segment),
      responsible_id = COALESCE(${b.responsibleId ?? null}, responsible_id),
      address        = COALESCE(${b.address ?? null}, address),
      city           = COALESCE(${b.city ?? null}, city),
      notes          = COALESCE(${b.notes ?? null}, notes),
      tags           = COALESCE(${b.tags ?? null}, tags),
      mrr            = COALESCE(${b.mrr ?? null}, mrr),
      updated_at     = NOW()
    WHERE id = ${id} RETURNING *
  `;
  if (!rows[0]) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  const r = rows[0];
  return NextResponse.json({ id: r.id, name: r.name, email: r.email, phone: r.phone, company: r.company, cnpj: r.cnpj, website: r.website, status: r.status, tier: r.tier, segment: r.segment, responsibleId: r.responsible_id, address: r.address, city: r.city, notes: r.notes, tags: r.tags ?? [], mrr: Number(r.mrr), createdAt: r.created_at, updatedAt: r.updated_at });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await sql`DELETE FROM clients WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}

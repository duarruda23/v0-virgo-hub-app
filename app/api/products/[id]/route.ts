import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await req.json();
  const rows = await sql`
    UPDATE products SET
      name          = COALESCE(${b.name ?? null}, name),
      description   = COALESCE(${b.description ?? null}, description),
      category      = COALESCE(${b.category ?? null}, category),
      price         = COALESCE(${b.price ?? null}, price),
      billing_cycle = COALESCE(${b.billingCycle ?? null}, billing_cycle),
      active        = COALESCE(${b.active ?? null}, active),
      deliverables  = COALESCE(${b.deliverables ?? null}, deliverables),
      updated_at    = NOW()
    WHERE id = ${id} RETURNING *
  `;
  if (!rows[0]) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  const r = rows[0];
  return NextResponse.json({ id: r.id, name: r.name, description: r.description, category: r.category, price: Number(r.price), billingCycle: r.billing_cycle, active: r.active, deliverables: r.deliverables ?? [], createdAt: r.created_at, updatedAt: r.updated_at });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await sql`DELETE FROM products WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}

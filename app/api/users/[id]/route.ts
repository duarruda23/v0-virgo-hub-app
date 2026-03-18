import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await req.json();
  const rows = await sql`
    UPDATE users SET
      name        = COALESCE(${b.name ?? null}, name),
      role        = COALESCE(${b.role ?? null}, role),
      avatar      = COALESCE(${b.avatar ?? null}, avatar),
      department  = COALESCE(${b.department ?? null}, department),
      position    = COALESCE(${b.position ?? null}, position),
      phone       = COALESCE(${b.phone ?? null}, phone),
      active      = COALESCE(${b.active ?? null}, active),
      updated_at  = NOW()
    WHERE id = ${id}
    RETURNING id, name, email, role, avatar, department, position, phone, active, created_at, updated_at
  `;
  if (!rows[0]) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await sql`DELETE FROM users WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}

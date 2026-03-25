import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await req.json();
  const [row] = await sql`
    UPDATE project_templates SET
      name        = COALESCE(${b.name ?? null}, name),
      description = COALESCE(${b.description ?? null}, description),
      category    = COALESCE(${b.category ?? null}, category),
      color       = COALESCE(${b.color ?? null}, color),
      icon        = COALESCE(${b.icon ?? null}, icon),
      updated_at  = NOW()
    WHERE id = ${id} RETURNING *
  `;
  if (!row) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json({ id: row.id, name: row.name, description: row.description, category: row.category, color: row.color, icon: row.icon });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await sql`DELETE FROM project_templates WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await req.json();
  const [row] = await sql`
    UPDATE project_checklist SET
      text     = COALESCE(${b.text ?? null}, text),
      done     = COALESCE(${b.done ?? null}, done),
      position = COALESCE(${b.position ?? null}, position)
    WHERE id = ${id} RETURNING *
  `;
  if (!row) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json({ id: row.id, projectId: row.project_id, text: row.text, done: row.done, position: row.position });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await sql`DELETE FROM project_checklist WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}

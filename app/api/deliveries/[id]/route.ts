import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await req.json();
  const rows = await sql`
    UPDATE deliveries SET
      title          = COALESCE(${b.title ?? null}, title),
      description    = COALESCE(${b.description ?? null}, description),
      project_id     = COALESCE(${b.projectId ?? null}, project_id),
      type           = COALESCE(${b.type ?? null}, type),
      status         = COALESCE(${b.status ?? null}, status),
      responsible_id = COALESCE(${b.responsibleId ?? null}, responsible_id),
      due_date       = COALESCE(${b.dueDate ?? null}, due_date),
      delivered_at   = COALESCE(${b.deliveredAt ?? null}, delivered_at),
      file_url       = COALESCE(${b.fileUrl ?? null}, file_url),
      review_notes   = COALESCE(${b.reviewNotes ?? null}, review_notes),
      updated_at     = NOW()
    WHERE id = ${id} RETURNING *
  `;
  if (!rows[0]) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  const r = rows[0];
  return NextResponse.json({ id: r.id, title: r.title, description: r.description, projectId: r.project_id, type: r.type, status: r.status, responsibleId: r.responsible_id, dueDate: r.due_date, deliveredAt: r.delivered_at, fileUrl: r.file_url, reviewNotes: r.review_notes, createdAt: r.created_at, updatedAt: r.updated_at });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await sql`DELETE FROM deliveries WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}

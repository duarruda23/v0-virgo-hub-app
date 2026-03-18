import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

function dbTo(r: Record<string, unknown>) {
  return { id: r.id, title: r.title, description: r.description, projectId: r.project_id, deliveryId: r.delivery_id, assigneeId: r.assignee_id, creatorId: r.creator_id, status: r.status, priority: r.priority, dueDate: r.due_date, completedAt: r.completed_at, tags: r.tags ?? [], createdAt: r.created_at, updatedAt: r.updated_at };
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await req.json();
  const rows = await sql`
    UPDATE tasks SET
      title        = COALESCE(${b.title ?? null}, title),
      description  = COALESCE(${b.description ?? null}, description),
      project_id   = COALESCE(${b.projectId ?? null}, project_id),
      delivery_id  = COALESCE(${b.deliveryId ?? null}, delivery_id),
      assignee_id  = COALESCE(${b.assigneeId ?? null}, assignee_id),
      status       = COALESCE(${b.status ?? null}, status),
      priority     = COALESCE(${b.priority ?? null}, priority),
      due_date     = COALESCE(${b.dueDate ?? null}, due_date),
      completed_at = COALESCE(${b.completedAt ?? null}, completed_at),
      tags         = COALESCE(${b.tags ?? null}, tags),
      updated_at   = NOW()
    WHERE id = ${id} RETURNING *
  `;
  if (!rows[0]) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(dbTo(rows[0]));
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await sql`DELETE FROM tasks WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}

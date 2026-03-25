import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params;
  const b = await req.json();
  const assigneeId = b.assigneeId !== undefined ? (b.assigneeId?.trim() !== "" ? b.assigneeId : null) : undefined;
  const [row] = await sql`
    UPDATE project_template_tasks SET
      title       = COALESCE(${b.title ?? null}, title),
      description = COALESCE(${b.description ?? null}, description),
      assignee_id = ${assigneeId !== undefined ? assigneeId : sql`assignee_id`},
      priority    = COALESCE(${b.priority ?? null}, priority),
      due_days    = COALESCE(${b.dueDays ?? null}, due_days),
      deliverable = COALESCE(${b.deliverable ?? null}, deliverable)
    WHERE id = ${taskId} RETURNING *
  `;
  if (!row) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json({ id: row.id, templateId: row.template_id, title: row.title, description: row.description, assigneeId: row.assignee_id, priority: row.priority, dueDays: row.due_days, position: row.position, deliverable: row.deliverable });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params;
  await sql`DELETE FROM project_template_tasks WHERE id = ${taskId}`;
  return NextResponse.json({ ok: true });
}

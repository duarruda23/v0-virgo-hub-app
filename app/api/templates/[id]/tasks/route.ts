import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { generateId } from "@/lib/utils-crm";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: templateId } = await params;
  const b = await req.json();
  const id = generateId("ttask");
  // Get next position
  const [{ max }] = await sql`SELECT COALESCE(MAX(position), -1) as max FROM project_template_tasks WHERE template_id = ${templateId}`;
  const position = Number(max) + 1;
  const [row] = await sql`
    INSERT INTO project_template_tasks (id, template_id, title, description, assignee_id, priority, due_days, position, deliverable)
    VALUES (${id}, ${templateId}, ${b.title}, ${b.description ?? null},
            ${b.assigneeId ?? null}, ${b.priority ?? "media"},
            ${b.dueDays ?? 0}, ${position}, ${b.deliverable ?? null})
    RETURNING *
  `;
  return NextResponse.json({
    id: row.id, templateId: row.template_id, title: row.title,
    description: row.description, assigneeId: row.assignee_id,
    priority: row.priority, dueDays: row.due_days,
    position: row.position, deliverable: row.deliverable,
  }, { status: 201 });
}

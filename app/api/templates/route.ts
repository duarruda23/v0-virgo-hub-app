import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { generateId } from "@/lib/utils-crm";

function dbToTemplate(r: Record<string, unknown>) {
  return {
    id: r.id, name: r.name, description: r.description,
    category: r.category, color: r.color, icon: r.icon,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

function dbToTask(r: Record<string, unknown>) {
  return {
    id: r.id, templateId: r.template_id, title: r.title,
    description: r.description, assigneeId: r.assignee_id,
    priority: r.priority, dueDays: r.due_days,
    position: r.position, deliverable: r.deliverable,
    createdAt: r.created_at,
  };
}

export async function GET() {
  const templates = await sql`SELECT * FROM project_templates ORDER BY created_at DESC`;
  const tasks = await sql`SELECT * FROM project_template_tasks ORDER BY position ASC`;
  return NextResponse.json(
    templates.map((t) => ({
      ...dbToTemplate(t),
      tasks: tasks.filter((tk) => tk.template_id === t.id).map(dbToTask),
    }))
  );
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  const id = generateId("tpl");
  const [row] = await sql`
    INSERT INTO project_templates (id, name, description, category, color, icon)
    VALUES (${id}, ${b.name}, ${b.description ?? null}, ${b.category ?? "geral"}, ${b.color ?? "#EAB308"}, ${b.icon ?? "layout"})
    RETURNING *
  `;
  return NextResponse.json({ ...dbToTemplate(row), tasks: [] }, { status: 201 });
}

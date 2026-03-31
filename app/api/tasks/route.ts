import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

function dbTo(r: Record<string, unknown>) {
  return { id: r.id, title: r.title, description: r.description, projectId: r.project_id, deliveryId: r.delivery_id, assigneeId: r.assignee_id, creatorId: r.creator_id, status: r.status, priority: r.priority, dueDate: r.due_date, completedAt: r.completed_at, estimatedHours: r.estimated_hours ? Number(r.estimated_hours) : null, tags: r.tags ?? [], createdAt: r.created_at, updatedAt: r.updated_at };
}

export async function GET() {
  const rows = await sql`SELECT * FROM tasks ORDER BY created_at DESC`;
  return NextResponse.json(rows.map(dbTo));
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  const rows = await sql`
    INSERT INTO tasks (title, description, project_id, delivery_id, assignee_id, creator_id, status, priority, due_date, estimated_hours, tags)
    VALUES (${b.title}, ${b.description ?? null}, ${b.projectId ?? null}, ${b.deliveryId ?? null},
            ${b.assigneeId ?? null}, ${b.creatorId ?? null}, ${b.status ?? "a_fazer"}, ${b.priority ?? "media"},
            ${b.dueDate ?? null}, ${b.estimatedHours ?? null}, ${b.tags ?? []})
    RETURNING *
  `;
  return NextResponse.json(dbTo(rows[0]), { status: 201 });
}

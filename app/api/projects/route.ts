import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

function dbToProject(r: Record<string, unknown>) {
  return { id: r.id, name: r.name, description: r.description, clientId: r.client_id, status: r.status, priority: r.priority, managerId: r.manager_id, teamIds: r.team_ids ?? [], budget: r.budget ? Number(r.budget) : undefined, startDate: r.start_date, dueDate: r.due_date, completedAt: r.completed_at, tags: r.tags ?? [], progress: Number(r.progress), createdAt: r.created_at, updatedAt: r.updated_at };
}

export async function GET() {
  const rows = await sql`SELECT * FROM projects ORDER BY created_at DESC`;
  return NextResponse.json(rows.map(dbToProject));
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  const rows = await sql`
    INSERT INTO projects (name, description, client_id, status, priority, manager_id, team_ids, budget, start_date, due_date, tags, progress)
    VALUES (${b.name}, ${b.description ?? null}, ${b.clientId ?? null}, ${b.status ?? "briefing"}, ${b.priority ?? "media"},
            ${b.managerId ?? null}, ${b.teamIds ?? []}, ${b.budget ?? null}, ${b.startDate}, ${b.dueDate}, ${b.tags ?? []}, ${b.progress ?? 0})
    RETURNING *
  `;
  return NextResponse.json(dbToProject(rows[0]), { status: 201 });
}

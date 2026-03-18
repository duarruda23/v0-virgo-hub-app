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

  // Sanitize: empty strings and placeholder IDs become null to avoid FK violations
  const clientId = b.clientId && b.clientId.trim() !== "" ? b.clientId : null;
  const managerId = b.managerId && b.managerId.trim() !== "" ? b.managerId : null;

  // Verify clientId exists in clients table if provided
  let safeClientId = clientId;
  if (clientId) {
    const check = await sql`SELECT id FROM clients WHERE id = ${clientId} LIMIT 1`;
    if (check.length === 0) safeClientId = null;
  }

  let safeManagerId = managerId;
  if (managerId) {
    const check = await sql`SELECT id FROM users WHERE id = ${managerId} LIMIT 1`;
    if (check.length === 0) safeManagerId = null;
  }

  const rows = await sql`
    INSERT INTO projects (name, description, client_id, status, priority, manager_id, team_ids, budget, start_date, due_date, tags, progress)
    VALUES (${b.name}, ${b.description ?? null}, ${safeClientId}, ${b.status ?? "briefing"}, ${b.priority ?? "media"},
            ${safeManagerId}, ${b.teamIds ?? []}, ${b.budget ?? null}, ${b.startDate ?? null}, ${b.dueDate ?? null}, ${b.tags ?? []}, ${b.progress ?? 0})
    RETURNING *
  `;
  return NextResponse.json(dbToProject(rows[0]), { status: 201 });
}

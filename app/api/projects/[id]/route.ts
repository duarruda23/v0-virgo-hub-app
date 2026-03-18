import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

function dbToProject(r: Record<string, unknown>) {
  return { id: r.id, name: r.name, description: r.description, clientId: r.client_id, status: r.status, priority: r.priority, managerId: r.manager_id, teamIds: r.team_ids ?? [], budget: r.budget ? Number(r.budget) : undefined, startDate: r.start_date, dueDate: r.due_date, completedAt: r.completed_at, tags: r.tags ?? [], progress: Number(r.progress), createdAt: r.created_at, updatedAt: r.updated_at };
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await req.json();

  // Sanitize: empty strings become null to avoid FK violations
  const clientId = b.clientId && b.clientId.trim() !== "" ? b.clientId : null;
  const managerId = b.managerId && b.managerId.trim() !== "" ? b.managerId : null;

  let safeClientId: string | null = clientId;
  if (clientId) {
    const check = await sql`SELECT id FROM clients WHERE id = ${clientId} LIMIT 1`;
    if (check.length === 0) safeClientId = null;
  }

  let safeManagerId: string | null = managerId;
  if (managerId) {
    const check = await sql`SELECT id FROM users WHERE id = ${managerId} LIMIT 1`;
    if (check.length === 0) safeManagerId = null;
  }

  const rows = await sql`
    UPDATE projects SET
      name         = COALESCE(${b.name ?? null}, name),
      description  = COALESCE(${b.description ?? null}, description),
      client_id    = COALESCE(${safeClientId}, client_id),
      status       = COALESCE(${b.status ?? null}, status),
      priority     = COALESCE(${b.priority ?? null}, priority),
      manager_id   = COALESCE(${safeManagerId}, manager_id),
      team_ids     = COALESCE(${b.teamIds ?? null}, team_ids),
      budget       = COALESCE(${b.budget ?? null}, budget),
      start_date   = COALESCE(${b.startDate ?? null}, start_date),
      due_date     = COALESCE(${b.dueDate ?? null}, due_date),
      completed_at = COALESCE(${b.completedAt ?? null}, completed_at),
      tags         = COALESCE(${b.tags ?? null}, tags),
      progress     = COALESCE(${b.progress ?? null}, progress),
      updated_at   = NOW()
    WHERE id = ${id} RETURNING *
  `;
  if (!rows[0]) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(dbToProject(rows[0]));
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await sql`DELETE FROM projects WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}

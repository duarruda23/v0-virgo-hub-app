// projects-id-route-v5 — due_date nullable no banco, toDate sanitiza strings vazias
import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { toDate } from "@/app/api/projects/route";

function dbToProject(r: Record<string, unknown>) {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    clientId: r.client_id,
    status: r.status,
    priority: r.priority,
    managerId: r.manager_id,
    teamIds: r.team_ids ?? [],
    budget: r.budget ? Number(r.budget) : undefined,
    startDate: r.start_date,
    dueDate: r.due_date,
    completedAt: r.completed_at,
    tags: r.tags ?? [],
    progress: Number(r.progress),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await req.json();

  const rawClientId = b.clientId?.trim() || null;
  const rawManagerId = b.managerId?.trim() || null;

  let safeClientId: string | null = null;
  if (rawClientId) {
    const check = await sql`SELECT id FROM clients WHERE id = ${rawClientId} LIMIT 1`;
    if (check.length > 0) safeClientId = rawClientId;
  }

  let safeManagerId: string | null = null;
  if (rawManagerId) {
    const check = await sql`SELECT id FROM users WHERE id = ${rawManagerId} LIMIT 1`;
    if (check.length > 0) safeManagerId = rawManagerId;
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
      budget       = COALESCE(${b.budget ? Number(b.budget) : null}, budget),
      start_date   = COALESCE(${toDate(b.startDate)}, start_date),
      due_date     = COALESCE(${toDate(b.dueDate)}, due_date),
      completed_at = COALESCE(${toDate(b.completedAt)}, completed_at),
      tags         = COALESCE(${b.tags ?? null}, tags),
      progress     = COALESCE(${b.progress != null ? Number(b.progress) : null}, progress),
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

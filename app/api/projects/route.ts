// projects-route-v5 — due_date nullable no banco, toDate sanitiza strings vazias
import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

/** Converte string vazia/"" ou inválida para null — evita DateTimeParseError no Neon */
export function toDate(val: unknown): string | null {
  if (val === null || val === undefined) return null;
  if (typeof val !== "string") return null;
  const trimmed = val.trim();
  if (trimmed === "") return null;
  return trimmed;
}

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

export async function GET() {
  const rows = await sql`SELECT * FROM projects ORDER BY created_at DESC`;
  return NextResponse.json(rows.map(dbToProject));
}

export async function POST(req: NextRequest) {
  const b = await req.json();

  // Sanitize: empty strings e IDs placeholder viram null para não violar FKs
  const rawClientId = b.clientId?.trim() || null;
  const rawManagerId = b.managerId?.trim() || null;

  // Verificar se clientId existe na tabela clients
  let safeClientId: string | null = null;
  if (rawClientId) {
    const check = await sql`SELECT id FROM clients WHERE id = ${rawClientId} LIMIT 1`;
    if (check.length > 0) safeClientId = rawClientId;
  }

  // Verificar se managerId existe na tabela users
  let safeManagerId: string | null = null;
  if (rawManagerId) {
    const check = await sql`SELECT id FROM users WHERE id = ${rawManagerId} LIMIT 1`;
    if (check.length > 0) safeManagerId = rawManagerId;
  }

  const startDate = toDate(b.startDate);
  const dueDate = toDate(b.dueDate);

  const rows = await sql`
    INSERT INTO projects (
      name, description, client_id, status, priority,
      manager_id, team_ids, budget, start_date, due_date, tags, progress
    ) VALUES (
      ${b.name},
      ${b.description ?? null},
      ${safeClientId},
      ${b.status ?? "briefing"},
      ${b.priority ?? "media"},
      ${safeManagerId},
      ${b.teamIds ?? []},
      ${b.budget ? Number(b.budget) : null},
      ${startDate},
      ${dueDate},
      ${b.tags ?? []},
      ${b.progress ?? 0}
    )
    RETURNING *
  `;
  return NextResponse.json(dbToProject(rows[0]), { status: 201 });
}

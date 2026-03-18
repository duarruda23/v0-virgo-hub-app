import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { generateId } from "@/lib/utils-crm";

function dbToAutomation(r: Record<string, unknown>) {
  const base = {
    id: r.id as string,
    stageId: r.stage_id as string,
    active: r.active as boolean,
  };
  if (r.type === "webhook") {
    return { ...base, type: "webhook" as const, url: (r.webhook_url ?? "") as string };
  }
  return {
    ...base,
    type: "task" as const,
    titleTemplate: (r.title_template ?? "") as string,
    priority: (r.priority ?? "media") as string,
    assigneeId: (r.assignee_id ?? "") as string,
    dueValue: Number(r.due_value ?? 1),
    dueUnit: (r.due_unit ?? "dias") as string,
  };
}

// GET /api/automations?stageId=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const stageId = searchParams.get("stageId");
  const rows = stageId
    ? await sql`SELECT * FROM stage_automations WHERE stage_id = ${stageId} ORDER BY created_at`
    : await sql`SELECT * FROM stage_automations ORDER BY stage_id, created_at`;
  return NextResponse.json(rows.map(dbToAutomation));
}

// POST /api/automations — cria novo gatilho
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { stageId, type, active = true } = body;
  if (!stageId || !type) return NextResponse.json({ error: "stageId e type obrigatórios" }, { status: 400 });

  const id = generateId("auto");

  if (type === "webhook") {
    const [row] = await sql`
      INSERT INTO stage_automations (id, stage_id, type, active, webhook_url, created_at)
      VALUES (${id}, ${stageId}, 'webhook', ${active}, ${body.url ?? ""}, now())
      RETURNING *
    `;
    return NextResponse.json(dbToAutomation(row), { status: 201 });
  }

  const [row] = await sql`
    INSERT INTO stage_automations (id, stage_id, type, active, title_template, priority, assignee_id, due_value, due_unit, created_at)
    VALUES (${id}, ${stageId}, 'task', ${active}, ${body.titleTemplate ?? "Follow-up: {{lead_name}}"}, ${body.priority ?? "media"}, ${body.assigneeId ?? ""}, ${body.dueValue ?? 1}, ${body.dueUnit ?? "dias"}, now())
    RETURNING *
  `;
  return NextResponse.json(dbToAutomation(row), { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {
  const rows = await sql`SELECT * FROM stage_automations ORDER BY created_at`;
  return NextResponse.json(rows.map(dbTo));
}

// Salva todas as automations de um stage (substitui)
export async function PUT(req: NextRequest) {
  const { stageId, automations } = await req.json();
  await sql`DELETE FROM stage_automations WHERE stage_id = ${stageId}`;
  for (const a of automations) {
    if (a.type === "webhook") {
      await sql`INSERT INTO stage_automations (stage_id, type, active, webhook_url) VALUES (${stageId}, 'webhook', ${a.active}, ${a.url ?? null})`;
    } else {
      await sql`INSERT INTO stage_automations (stage_id, type, active, title_template, priority, assignee_id, due_value, due_unit)
        VALUES (${stageId}, 'task', ${a.active}, ${a.titleTemplate ?? null}, ${a.priority ?? "media"}, ${a.assigneeId ?? null}, ${a.dueValue ?? 1}, ${a.dueUnit ?? "dias"})`;
    }
  }
  return NextResponse.json({ ok: true });
}

function dbTo(r: Record<string, unknown>) {
  if (r.type === "webhook") return { stageId: r.stage_id, type: "webhook", active: r.active, url: r.webhook_url };
  return { stageId: r.stage_id, type: "task", active: r.active, titleTemplate: r.title_template, priority: r.priority, assigneeId: r.assignee_id, dueValue: Number(r.due_value), dueUnit: r.due_unit };
}

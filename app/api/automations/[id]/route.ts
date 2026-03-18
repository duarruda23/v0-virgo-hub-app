import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

// PATCH /api/automations/:id — atualiza gatilho
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const rows = await sql`SELECT * FROM stage_automations WHERE id = ${id}`;
  if (!rows.length) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  const current = rows[0];

  if (current.type === "webhook") {
    await sql`
      UPDATE stage_automations SET
        active = ${body.active ?? current.active},
        webhook_url = ${body.url ?? current.webhook_url}
      WHERE id = ${id}
    `;
  } else {
    await sql`
      UPDATE stage_automations SET
        active = ${body.active ?? current.active},
        title_template = ${body.titleTemplate ?? current.title_template},
        priority = ${body.priority ?? current.priority},
        assignee_id = ${body.assigneeId ?? current.assignee_id},
        due_value = ${body.dueValue ?? current.due_value},
        due_unit = ${body.dueUnit ?? current.due_unit}
      WHERE id = ${id}
    `;
  }

  const [updated] = await sql`SELECT * FROM stage_automations WHERE id = ${id}`;
  return NextResponse.json(updated);
}

// DELETE /api/automations/:id
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await sql`DELETE FROM stage_automations WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}

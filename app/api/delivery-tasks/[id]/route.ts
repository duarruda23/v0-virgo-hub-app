import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await req.json();

  // Subtarefa
  if (b._subtask) {
    const rows = await sql`
      UPDATE delivery_subtasks SET
        title      = COALESCE(${b.title ?? null}, title),
        status     = COALESCE(${b.status ?? null}, status),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ id: rows[0].id, deliveryId: rows[0].delivery_id, parentKey: rows[0].parent_key, key: rows[0].key, title: rows[0].title, status: rows[0].status });
  }

  // Task principal
  const rows = await sql`
    UPDATE delivery_tasks SET
      title       = COALESCE(${b.title ?? null}, title),
      status      = COALESCE(${b.status ?? null}, status),
      assignee_id = COALESCE(${b.assigneeId ?? null}, assignee_id),
      quantity    = COALESCE(${b.quantity ?? null}, quantity),
      enabled     = COALESCE(${b.enabled ?? null}, enabled),
      notes       = COALESCE(${b.notes ?? null}, notes),
      updated_at  = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ id: rows[0].id, deliveryId: rows[0].delivery_id, type: rows[0].type, key: rows[0].key, title: rows[0].title, status: rows[0].status, assigneeId: rows[0].assignee_id, quantity: rows[0].quantity, enabled: rows[0].enabled });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Tenta nas duas tabelas
  await sql`DELETE FROM delivery_tasks WHERE id = ${id}`;
  await sql`DELETE FROM delivery_subtasks WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}

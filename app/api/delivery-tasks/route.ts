import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

function generateId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function dbToTask(r: Record<string, unknown>) {
  return {
    id: r.id, deliveryId: r.delivery_id, type: r.type, key: r.key,
    title: r.title, status: r.status, assigneeId: r.assignee_id,
    quantity: r.quantity, enabled: r.enabled, notes: r.notes, position: r.position,
  };
}

function dbToSubtask(r: Record<string, unknown>) {
  return {
    id: r.id, deliveryId: r.delivery_id, parentKey: r.parent_key,
    key: r.key, title: r.title, status: r.status, position: r.position,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const deliveryId = searchParams.get("deliveryId");
  if (!deliveryId) return NextResponse.json({ tasks: [], subtasks: [] });
  const tasks = await sql`SELECT * FROM delivery_tasks WHERE delivery_id = ${deliveryId} ORDER BY position`;
  const subtasks = await sql`SELECT * FROM delivery_subtasks WHERE delivery_id = ${deliveryId} ORDER BY position`;
  return NextResponse.json({ tasks: tasks.map(dbToTask), subtasks: subtasks.map(dbToSubtask) });
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  if (b._subtask) {
    const id = generateId("dst");
    const rows = await sql`
      INSERT INTO delivery_subtasks (id, delivery_id, parent_key, key, title, status, position)
      VALUES (${id}, ${b.deliveryId}, ${b.parentKey}, ${b.key}, ${b.title}, ${b.status ?? "pendente"}, ${b.position ?? 0})
      RETURNING *
    `;
    return NextResponse.json(dbToSubtask(rows[0]), { status: 201 });
  }
  const id = generateId("dt");
  const rows = await sql`
    INSERT INTO delivery_tasks (id, delivery_id, type, key, title, status, assignee_id, quantity, enabled, notes, position)
    VALUES (${id}, ${b.deliveryId}, ${b.type ?? "fixed"}, ${b.key}, ${b.title}, ${b.status ?? "pendente"},
            ${b.assigneeId ?? null}, ${b.quantity ?? 1}, ${b.enabled ?? true}, ${b.notes ?? null}, ${b.position ?? 0})
    RETURNING *
  `;
  return NextResponse.json(dbToTask(rows[0]), { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

function toDate(val: unknown): string | null {
  if (!val || typeof val !== "string" || val.trim() === "") return null;
  return val.trim();
}

function dbToEntry(r: Record<string, unknown>) {
  return {
    id: r.id,
    clientId: r.client_id,
    projectId: r.project_id,
    type: r.type,
    category: r.category,
    description: r.description,
    amount: Number(r.amount),
    status: r.status,
    dueDate: r.due_date,
    paidAt: r.paid_at,
    recurrent: r.recurrent,
    notes: r.notes,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await req.json();
  const rows = await sql`
    UPDATE financial_entries SET
      client_id   = COALESCE(${b.clientId ?? null}, client_id),
      project_id  = COALESCE(${b.projectId ?? null}, project_id),
      type        = COALESCE(${b.type ?? null}, type),
      category    = COALESCE(${b.category ?? null}, category),
      description = COALESCE(${b.description ?? null}, description),
      amount      = COALESCE(${b.amount != null ? Number(b.amount) : null}, amount),
      status      = COALESCE(${b.status ?? null}, status),
      due_date    = COALESCE(${toDate(b.dueDate)}, due_date),
      paid_at     = ${b.paidAt !== undefined ? toDate(b.paidAt) : sql`paid_at`},
      recurrent   = COALESCE(${b.recurrent ?? null}, recurrent),
      notes       = COALESCE(${b.notes ?? null}, notes),
      updated_at  = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(dbToEntry(rows[0]));
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await sql`DELETE FROM financial_entries WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}

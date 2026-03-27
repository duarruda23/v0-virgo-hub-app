import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

function toDate(val: unknown): string | null {
  if (!val || typeof val !== "string" || val.trim() === "") return null;
  return val.trim();
}

function generateId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  const month = searchParams.get("month"); // formato YYYY-MM

  let rows;
  if (clientId) {
    rows = await sql`SELECT * FROM financial_entries WHERE client_id = ${clientId} ORDER BY due_date DESC NULLS LAST, created_at DESC`;
  } else if (month) {
    rows = await sql`SELECT * FROM financial_entries WHERE to_char(COALESCE(due_date, created_at::date), 'YYYY-MM') = ${month} ORDER BY due_date ASC NULLS LAST`;
  } else {
    rows = await sql`SELECT * FROM financial_entries ORDER BY due_date DESC NULLS LAST, created_at DESC`;
  }
  return NextResponse.json(rows.map(dbToEntry));
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  const id = generateId("fin");
  const rows = await sql`
    INSERT INTO financial_entries
      (id, client_id, project_id, type, category, description, amount, status, due_date, paid_at, recurrent, notes)
    VALUES
      (${id}, ${b.clientId ?? null}, ${b.projectId ?? null}, ${b.type ?? "receita"},
       ${b.category ?? "avulso"}, ${b.description}, ${Number(b.amount) || 0},
       ${b.status ?? "pendente"}, ${toDate(b.dueDate)}, ${toDate(b.paidAt)},
       ${b.recurrent ?? false}, ${b.notes ?? null})
    RETURNING *
  `;
  return NextResponse.json(dbToEntry(rows[0]), { status: 201 });
}

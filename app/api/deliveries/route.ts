import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

function dbTo(r: Record<string, unknown>) {
  return {
    id: r.id, title: r.title, description: r.description,
    projectId: r.project_id, clientId: r.client_id, month: r.month,
    type: r.type, status: r.status, responsibleId: r.responsible_id,
    dueDate: r.due_date, deliveredAt: r.delivered_at,
    fileUrl: r.file_url, reviewNotes: r.review_notes,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  const month = searchParams.get("month");
  const rows = clientId
    ? await sql`SELECT * FROM deliveries WHERE client_id = ${clientId} ORDER BY created_at DESC`
    : month
    ? await sql`SELECT * FROM deliveries WHERE month = ${month} ORDER BY created_at DESC`
    : await sql`SELECT * FROM deliveries ORDER BY created_at DESC`;
  return NextResponse.json(rows.map(dbTo));
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  const rows = await sql`
    INSERT INTO deliveries (title, description, project_id, client_id, month, type, status, responsible_id, due_date, file_url, review_notes)
    VALUES (${b.title}, ${b.description ?? null}, ${b.projectId ?? null}, ${b.clientId ?? null},
            ${b.month ?? null}, ${b.type ?? "outro"}, ${b.status ?? "pendente"},
            ${b.responsibleId ?? null}, ${b.dueDate ?? null}, ${b.fileUrl ?? null}, ${b.reviewNotes ?? null})
    RETURNING *
  `;
  return NextResponse.json(dbTo(rows[0]), { status: 201 });
}

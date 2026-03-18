import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

function dbTo(r: Record<string, unknown>) {
  return { id: r.id, title: r.title, description: r.description, projectId: r.project_id, type: r.type, status: r.status, responsibleId: r.responsible_id, dueDate: r.due_date, deliveredAt: r.delivered_at, fileUrl: r.file_url, reviewNotes: r.review_notes, createdAt: r.created_at, updatedAt: r.updated_at };
}

export async function GET() {
  const rows = await sql`SELECT * FROM deliveries ORDER BY created_at DESC`;
  return NextResponse.json(rows.map(dbTo));
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  const rows = await sql`
    INSERT INTO deliveries (title, description, project_id, type, status, responsible_id, due_date, file_url, review_notes)
    VALUES (${b.title}, ${b.description ?? null}, ${b.projectId ?? null}, ${b.type ?? "outro"}, ${b.status ?? "pendente"},
            ${b.responsibleId ?? null}, ${b.dueDate}, ${b.fileUrl ?? null}, ${b.reviewNotes ?? null})
    RETURNING *
  `;
  return NextResponse.json(dbTo(rows[0]), { status: 201 });
}

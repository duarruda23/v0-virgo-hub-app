import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {
  const rows = await sql`SELECT * FROM leads ORDER BY created_at DESC`;
  return NextResponse.json(rows.map(dbToLead));
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  const rows = await sql`
    INSERT INTO leads (name, email, phone, company, status, source, value, responsible_id, notes, tags, next_follow_up, lost_reason, converted_client_id)
    VALUES (${b.name}, ${b.email}, ${b.phone ?? null}, ${b.company ?? null}, ${b.status ?? "novo"}, ${b.source ?? "outros"},
            ${b.value ?? 0}, ${b.responsibleId ?? null}, ${b.notes ?? null}, ${b.tags ?? []},
            ${b.nextFollowUp ?? null}, ${b.lostReason ?? null}, ${b.convertedClientId ?? null})
    RETURNING *
  `;
  return NextResponse.json(dbToLead(rows[0]), { status: 201 });
}

function dbToLead(r: Record<string, unknown>) {
  return { id: r.id, name: r.name, email: r.email, phone: r.phone, company: r.company, status: r.status, source: r.source, value: Number(r.value), responsibleId: r.responsible_id, notes: r.notes, tags: r.tags ?? [], nextFollowUp: r.next_follow_up, lostReason: r.lost_reason, convertedClientId: r.converted_client_id, createdAt: r.created_at, updatedAt: r.updated_at };
}

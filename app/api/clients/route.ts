import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {
  const rows = await sql`SELECT * FROM clients ORDER BY created_at DESC`;
  return NextResponse.json(rows.map(dbToClient));
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  const rows = await sql`
    INSERT INTO clients (name, email, phone, company, cnpj, website, status, tier, segment, responsible_id, address, city, notes, tags, mrr)
    VALUES (${b.name}, ${b.email}, ${b.phone ?? null}, ${b.company ?? null}, ${b.cnpj ?? null}, ${b.website ?? null},
            ${b.status ?? "ativo"}, ${b.tier ?? "basic"}, ${b.segment ?? null}, ${b.responsibleId ?? null},
            ${b.address ?? null}, ${b.city ?? null}, ${b.notes ?? null}, ${b.tags ?? []}, ${b.mrr ?? 0})
    RETURNING *
  `;
  return NextResponse.json(dbToClient(rows[0]), { status: 201 });
}

function dbToClient(r: Record<string, unknown>) {
  return { id: r.id, name: r.name, email: r.email, phone: r.phone, company: r.company, cnpj: r.cnpj, website: r.website, status: r.status, tier: r.tier, segment: r.segment, responsibleId: r.responsible_id, address: r.address, city: r.city, notes: r.notes, tags: r.tags ?? [], mrr: Number(r.mrr), createdAt: r.created_at, updatedAt: r.updated_at };
}

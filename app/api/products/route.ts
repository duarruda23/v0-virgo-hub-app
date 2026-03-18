import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

function dbTo(r: Record<string, unknown>) {
  return { id: r.id, name: r.name, description: r.description, category: r.category, price: Number(r.price), billingCycle: r.billing_cycle, active: r.active, deliverables: r.deliverables ?? [], createdAt: r.created_at, updatedAt: r.updated_at };
}

export async function GET() {
  const rows = await sql`SELECT * FROM products ORDER BY created_at DESC`;
  return NextResponse.json(rows.map(dbTo));
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  const rows = await sql`
    INSERT INTO products (name, description, category, price, billing_cycle, active, deliverables)
    VALUES (${b.name}, ${b.description ?? null}, ${b.category ?? "outro"}, ${b.price ?? 0}, ${b.billingCycle ?? "mensal"}, ${b.active ?? true}, ${b.deliverables ?? []})
    RETURNING *
  `;
  return NextResponse.json(dbTo(rows[0]), { status: 201 });
}

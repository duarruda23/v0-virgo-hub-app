import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {
  const rows = await sql`SELECT id, name, email, role, avatar, department, position, phone, active, daily_capacity, created_at, updated_at FROM users ORDER BY created_at`;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  const rows = await sql`
    INSERT INTO users (name, email, password, role, avatar, department, position, phone, active, daily_capacity)
    VALUES (${b.name}, ${b.email?.toLowerCase()}, ${b.password}, ${b.role ?? "collaborator"}, ${b.avatar ?? null},
            ${b.department ?? null}, ${b.position ?? null}, ${b.phone ?? null}, ${b.active ?? true},
            ${b.dailyCapacity ?? 8})
    RETURNING id, name, email, role, avatar, department, position, phone, active, daily_capacity, created_at, updated_at
  `;
  return NextResponse.json(rows[0], { status: 201 });
}

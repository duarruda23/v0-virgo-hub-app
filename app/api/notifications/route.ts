import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {
  const rows = await sql`SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50`;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  const rows = await sql`
    INSERT INTO notifications (title, message, type, link, user_id)
    VALUES (${b.title}, ${b.message}, ${b.type ?? "info"}, ${b.link ?? null}, ${b.userId ?? null})
    RETURNING *
  `;
  return NextResponse.json(rows[0], { status: 201 });
}

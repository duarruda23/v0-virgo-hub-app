import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await req.json();
  const rows = await sql`
    UPDATE notifications SET read = ${b.read ?? true} WHERE id = ${id} RETURNING *
  `;
  return NextResponse.json(rows[0]);
}

import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {
  const rows = await sql`SELECT * FROM pipeline_stages ORDER BY "order"`;
  return NextResponse.json(rows.map((r: Record<string, unknown>) => ({ id: r.id, label: r.label, color: r.color, order: Number(r.order) })));
}

export async function PUT(req: NextRequest) {
  // Substitui todos os stages (reorder/add/delete)
  const stages: Array<{ id: string; label: string; color: string; order: number }> = await req.json();

  await sql`DELETE FROM pipeline_stages WHERE id NOT IN ${sql(stages.map((s) => s.id))}`;

  for (const s of stages) {
    await sql`
      INSERT INTO pipeline_stages (id, label, color, "order")
      VALUES (${s.id}, ${s.label}, ${s.color}, ${s.order})
      ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, color = EXCLUDED.color, "order" = EXCLUDED."order"
    `;
  }

  return NextResponse.json({ ok: true });
}

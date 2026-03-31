import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

// PATCH /api/pauta/[id] — atualiza item ou config
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await req.json();

  if (b._type === "config") {
    const rows = await sql`
      UPDATE pauta_client_config SET
        qty_videos      = COALESCE(${b.qtyVideos ?? null}, qty_videos),
        qty_designs     = COALESCE(${b.qtyDesigns ?? null}, qty_designs),
        has_landing_page = COALESCE(${b.hasLandingPage ?? null}, has_landing_page)
      WHERE id = ${id} RETURNING *
    `;
    return NextResponse.json(rows[0] ?? { error: "not found" });
  }

  const rows = await sql`
    UPDATE pauta_items SET
      is_completed = COALESCE(${b.isCompleted ?? null}, is_completed),
      completed_at = CASE WHEN ${b.isCompleted ?? null} IS NOT NULL AND ${b.isCompleted ?? false}
                         THEN NOW() ELSE completed_at END,
      assigned_to  = COALESCE(${b.assignedTo ?? null}, assigned_to),
      notes        = COALESCE(${b.notes ?? null}, notes)
    WHERE id = ${id} RETURNING *
  `;
  return NextResponse.json(rows[0] ?? { error: "not found" });
}

// DELETE /api/pauta/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await sql`DELETE FROM pauta_items WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}

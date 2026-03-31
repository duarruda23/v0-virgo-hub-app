import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

// GET /api/pauta?month=5&year=2025
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  // Busca ou cria o mês
  let monthRow;
  if (month && year) {
    const existing = await sql`
      SELECT * FROM pauta_months WHERE month = ${parseInt(month)} AND year = ${parseInt(year)}
    `;
    if (existing.length > 0) {
      monthRow = existing[0];
    } else {
      const created = await sql`
        INSERT INTO pauta_months (month, year, label)
        VALUES (${parseInt(month)}, ${parseInt(year)}, ${`${month}/${year}`})
        RETURNING *
      `;
      monthRow = created[0];
    }
  } else {
    // Retorna todos os meses
    const months = await sql`SELECT * FROM pauta_months ORDER BY year DESC, month DESC`;
    return NextResponse.json(months);
  }

  // Busca tipos de entrega
  const deliveryTypes = await sql`
    SELECT * FROM pauta_delivery_types WHERE is_active = TRUE ORDER BY sort_order
  `;

  // Busca items do mês
  const items = await sql`
    SELECT * FROM pauta_items WHERE pauta_month_id = ${monthRow.id}
  `;

  // Busca configs de clientes
  const configs = await sql`
    SELECT * FROM pauta_client_config WHERE pauta_month_id = ${monthRow.id}
  `;

  return NextResponse.json({ month: monthRow, deliveryTypes, items, configs });
}

// POST /api/pauta — cria/atualiza item ou config
export async function POST(req: NextRequest) {
  const b = await req.json();

  if (b._type === "config") {
    // Upsert pauta_client_config
    const rows = await sql`
      INSERT INTO pauta_client_config (pauta_month_id, client_id, qty_videos, qty_designs, has_landing_page)
      VALUES (${b.pautaMonthId}, ${b.clientId}, ${b.qtyVideos ?? 0}, ${b.qtyDesigns ?? 0}, ${b.hasLandingPage ?? false})
      ON CONFLICT (pauta_month_id, client_id)
      DO UPDATE SET
        qty_videos = ${b.qtyVideos ?? 0},
        qty_designs = ${b.qtyDesigns ?? 0},
        has_landing_page = ${b.hasLandingPage ?? false}
      RETURNING *
    `;
    return NextResponse.json(rows[0]);
  }

  // Upsert pauta_item
  const rows = await sql`
    INSERT INTO pauta_items (pauta_month_id, client_id, delivery_type_id, is_completed, assigned_to, notes)
    VALUES (${b.pautaMonthId}, ${b.clientId}, ${b.deliveryTypeId},
            ${b.isCompleted ?? false}, ${b.assignedTo ?? null}, ${b.notes ?? null})
    ON CONFLICT (pauta_month_id, client_id, delivery_type_id)
    DO UPDATE SET
      is_completed = ${b.isCompleted ?? false},
      completed_at = CASE WHEN ${b.isCompleted ?? false} THEN NOW() ELSE NULL END,
      assigned_to = ${b.assignedTo ?? null},
      notes = ${b.notes ?? null}
    RETURNING *
  `;
  return NextResponse.json(rows[0]);
}

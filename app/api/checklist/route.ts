import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { generateId } from "@/lib/utils-crm";

export async function GET(req: NextRequest) {
  const projectId = new URL(req.url).searchParams.get("projectId");
  if (!projectId) return NextResponse.json([]);
  const rows = await sql`
    SELECT * FROM project_checklist
    WHERE project_id = ${projectId}
    ORDER BY position ASC, created_at ASC
  `;
  return NextResponse.json(rows.map(dbToItem));
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  const id = generateId("ck");
  const [maxRow] = await sql`
    SELECT COALESCE(MAX(position), -1) AS max_pos FROM project_checklist WHERE project_id = ${b.projectId}
  `;
  const position = (maxRow.max_pos as number) + 1;
  const [row] = await sql`
    INSERT INTO project_checklist (id, project_id, text, done, position)
    VALUES (${id}, ${b.projectId}, ${b.text}, false, ${position})
    RETURNING *
  `;
  return NextResponse.json(dbToItem(row), { status: 201 });
}

function dbToItem(r: Record<string, unknown>) {
  return { id: r.id, projectId: r.project_id, text: r.text, done: r.done, position: r.position, createdAt: r.created_at };
}

import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function POST(req: NextRequest) {
  const { name, email, password, role } = await req.json();
  if (!name || !email || !password) return NextResponse.json({ error: "Campos obrigatórios" }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ error: "Senha deve ter mínimo 6 caracteres" }, { status: 400 });

  const existing = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase()} LIMIT 1`;
  if (existing.length > 0) return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 });

  // Primeiro usuário sempre vira admin
  const count = await sql`SELECT COUNT(*) as c FROM users`;
  const isFirst = Number(count[0].c) === 0;

  const rows = await sql`
    INSERT INTO users (name, email, password, role)
    VALUES (${name.trim()}, ${email.toLowerCase().trim()}, ${password}, ${isFirst ? "admin" : (role ?? "collaborator")})
    RETURNING id, name, email, role, avatar, department, position, phone, active, created_at, updated_at
  `;
  return NextResponse.json({ user: rows[0] }, { status: 201 });
}

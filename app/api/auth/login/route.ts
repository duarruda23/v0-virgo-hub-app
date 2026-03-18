import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) return NextResponse.json({ error: "Campos obrigatórios" }, { status: 400 });

  const rows = await sql`SELECT * FROM users WHERE email = ${email.toLowerCase()} AND active = true LIMIT 1`;
  const user = rows[0];
  if (!user || user.password !== password) {
    return NextResponse.json({ error: "E-mail ou senha incorretos" }, { status: 401 });
  }

  const { password: _, ...safe } = user;
  return NextResponse.json({ user: safe });
}

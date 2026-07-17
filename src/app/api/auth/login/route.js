import { NextResponse } from "next/server";
import { readDb } from "@/lib/serverDb";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const db = readDb();
    if (!db.customers) db.customers = [];

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    const user = db.customers.find(
      c => c.email.trim().toLowerCase() === normalizedEmail && c.password.trim() === normalizedPassword
    );

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // Return without password
    const { password: _pw, ...safeUser } = user;
    return NextResponse.json({ success: true, user: safeUser }, { status: 200 });
  } catch (err) {
    console.error("[API /auth/login]", err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}

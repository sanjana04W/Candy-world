import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/serverDb";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, newPassword } = body;

    if (!email || !newPassword) {
      return NextResponse.json({ error: "Email and new password are required." }, { status: 400 });
    }

    if (newPassword.trim().length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    const db = readDb();
    if (!db.customers) db.customers = [];

    const normalizedEmail = email.trim().toLowerCase();
    const index = db.customers.findIndex(c => c.email.trim().toLowerCase() === normalizedEmail);

    if (index === -1) {
      return NextResponse.json({ error: "No account found with this email address." }, { status: 404 });
    }

    db.customers[index].password = newPassword.trim();
    writeDb(db);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[API /auth/update-password]", err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}

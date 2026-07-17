import { NextResponse } from "next/server";
import { readDb } from "@/lib/serverDb";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const db = readDb();
    if (!db.customers) db.customers = [];

    const normalizedEmail = email.trim().toLowerCase();
    const user = db.customers.find(c => c.email.trim().toLowerCase() === normalizedEmail);

    if (!user) {
      return NextResponse.json({ error: "No account found with this email address." }, { status: 404 });
    }

    // In a real app, send a reset email here via EmailJS or Nodemailer.
    // For now, return success — the frontend will show "email sent" message.
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[API /auth/reset-password]", err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}

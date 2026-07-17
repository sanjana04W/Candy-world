import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/serverDb";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
    }

    const db = readDb();
    if (!db.customers) db.customers = [];

    const normalizedEmail = email.trim().toLowerCase();
    const exists = db.customers.find(c => c.email.trim().toLowerCase() === normalizedEmail);
    if (exists) {
      return NextResponse.json({ error: "Email already registered." }, { status: 409 });
    }

    const newCustomer = {
      customerId: `cust-${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      password: password.trim(),
      phone: phone ? phone.trim() : "",
      addresses: [],
      totalOrdersCount: 0,
      lifetimeValue: 0,
      createdAt: new Date().toISOString(),
    };

    db.customers.push(newCustomer);
    writeDb(db);

    // Return without password
    const { password: _pw, ...safeUser } = newCustomer;
    return NextResponse.json({ success: true, user: safeUser }, { status: 201 });
  } catch (err) {
    console.error("[API /auth/register]", err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}

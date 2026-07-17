import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function getDbPath() {
  const primary = path.join(process.cwd(), "mock-db.json");
  try {
    fs.accessSync(primary, fs.constants.W_OK);
    return primary;
  } catch {
    const tmp = path.join("/tmp", "mock-db.json");
    if (!fs.existsSync(tmp)) {
      try {
        const src = fs.readFileSync(primary, "utf-8");
        fs.writeFileSync(tmp, src, "utf-8");
      } catch {
        fs.writeFileSync(tmp, JSON.stringify({ customers: [] }, null, 2), "utf-8");
      }
    }
    return tmp;
  }
}

function readDb() {
  try { return JSON.parse(fs.readFileSync(getDbPath(), "utf-8")); }
  catch { return { customers: [] }; }
}

function writeDb(data) {
  fs.writeFileSync(getDbPath(), JSON.stringify(data, null, 2), "utf-8");
}

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

    const { password: _pw, ...safeUser } = newCustomer;
    return NextResponse.json({ success: true, user: safeUser }, { status: 201 });
  } catch (err) {
    console.error("[API /auth/register]", err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}

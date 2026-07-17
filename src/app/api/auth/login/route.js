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

    const { password: _pw, ...safeUser } = user;
    return NextResponse.json({ success: true, user: safeUser }, { status: 200 });
  } catch (err) {
    console.error("[API /auth/login]", err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}

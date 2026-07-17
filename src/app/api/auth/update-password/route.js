import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// On Vercel, process.cwd() is read-only. We try the project root first,
// then fall back to /tmp (writable but ephemeral — good enough for dev/demo).
function getDbPath() {
  const primary = path.join(process.cwd(), "mock-db.json");
  try {
    fs.accessSync(primary, fs.constants.W_OK);
    return primary;
  } catch {
    const tmp = path.join("/tmp", "mock-db.json");
    // Seed /tmp if it doesn't exist yet
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
  try {
    return JSON.parse(fs.readFileSync(getDbPath(), "utf-8"));
  } catch {
    return { customers: [] };
  }
}

function writeDb(data) {
  fs.writeFileSync(getDbPath(), JSON.stringify(data, null, 2), "utf-8");
}

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
    const index = db.customers.findIndex(
      (c) => c.email.trim().toLowerCase() === normalizedEmail
    );

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

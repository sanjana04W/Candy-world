import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const dbPath = path.join(process.cwd(), 'mock-db.json');
const SESSION_COOKIE = 'candy_world_session';

// Read DB
export async function GET(req) {
  try {
    if (!fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, JSON.stringify({}));
    }
    const data = fs.readFileSync(dbPath, 'utf8');
    return NextResponse.json(JSON.parse(data));
  } catch (e) {
    return NextResponse.json({});
  }
}

// Write to DB
export async function POST(req) {
  try {
    const body = await req.json();

    // Handle session save/get specially
    if (body.action === 'saveSession') {
      const res = NextResponse.json({ success: true });
      res.cookies.set(SESSION_COOKIE, JSON.stringify(body.user), {
        httpOnly: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
      return res;
    }

    if (body.action === 'clearSession') {
      const res = NextResponse.json({ success: true });
      res.cookies.delete(SESSION_COOKIE);
      return res;
    }

    const { key, data } = body;
    let db = {};
    if (fs.existsSync(dbPath)) {
      db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    }
    db[key] = data;
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message });
  }
}

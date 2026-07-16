import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const defaultDbPath = path.join(process.cwd(), 'mock-db.json');
const tmpDbPath = path.join(os.tmpdir(), 'mock-db.json');
const SESSION_COOKIE = 'candy_world_session';

function getDbPath() {
  // If we've successfully written to tmp before, prioritize it
  if (fs.existsSync(tmpDbPath)) return tmpDbPath;
  return defaultDbPath;
}

// Read DB
export async function GET() {
  try {
    const dbPath = getDbPath();
    if (!fs.existsSync(dbPath)) {
      try {
        fs.writeFileSync(dbPath, JSON.stringify({}));
      } catch (e) {
        if (e.code === 'EROFS') {
          fs.writeFileSync(tmpDbPath, JSON.stringify({}));
        }
      }
    }
    const targetPath = getDbPath();
    const data = fs.readFileSync(targetPath, 'utf8');
    return NextResponse.json(JSON.parse(data));
  } catch (e) {
    return NextResponse.json({});
  }
}

// Write to DB
export async function POST(req) {
  try {
    const body = await req.json();

    // Handle session save specially (set cookie on response)
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

    // Normal DB write
    const { key, data } = body;
    if (!key) {
      return NextResponse.json({ success: false, error: 'Missing key' });
    }
    
    const dbPath = getDbPath();
    let db = {};
    if (fs.existsSync(dbPath)) {
      db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    }
    db[key] = data;
    
    try {
      fs.writeFileSync(defaultDbPath, JSON.stringify(db, null, 2));
    } catch (e) {
      if (e.code === 'EROFS') {
        // Fallback to /tmp if filesystem is read-only (e.g. Vercel)
        fs.writeFileSync(tmpDbPath, JSON.stringify(db, null, 2));
      } else {
        throw e;
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[mockDb API error]', e.message);
    return NextResponse.json({ success: false, error: e.message });
  }
}

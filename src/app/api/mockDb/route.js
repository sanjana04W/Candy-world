import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'mock-db.json');

// Read DB
export async function GET() {
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
    const { key, data } = await req.json();
    let db = {};
    if (fs.existsSync(dbPath)) {
      db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    }
    db[key] = data;
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false });
  }
}

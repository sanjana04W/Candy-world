/**
 * serverDb.js — Server-side only helper (Node.js runtime).
 * Reads and writes the shared mock-db.json file.
 * This runs ONLY in API routes, never in the browser.
 */
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "mock-db.json");

export function readDb() {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("[serverDb] Failed to read mock-db.json:", err);
    return {};
  }
}

export function writeDb(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("[serverDb] Failed to write mock-db.json:", err);
    throw err;
  }
}

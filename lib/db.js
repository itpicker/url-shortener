import { neon } from "@neondatabase/serverless";
import { isLocal, readRows, mutateRows } from "./local-store";
export function getSql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL을 설정하세요.");
  return neon(process.env.DATABASE_URL);
}
export async function saveUrl(shortCode, originalUrl) {
  if (isLocal()) {
    mutateRows(rows => {
      const old = rows.find(row => row.short_code === shortCode);
      if (old && old.original_url !== originalUrl) throw new Error("Short code collision");
      if (!old) rows.push({ short_code: shortCode, original_url: originalUrl,
        created_at: new Date().toISOString(), click_count: 0, last_clicked_at: null });
    });
    return;
  }
  const sql = getSql();
  await sql`INSERT INTO urls (short_code, original_url) VALUES (${shortCode}, ${originalUrl}) ON CONFLICT (short_code) DO NOTHING`;
}
export async function findUrlByShortCode(shortCode) {
  if (isLocal()) return readRows().find(row => row.short_code === shortCode)?.original_url ?? null;
  const sql = getSql();
  const rows = await sql`SELECT original_url FROM urls WHERE short_code = ${shortCode} LIMIT 1`;
  return rows[0]?.original_url ?? null;
}

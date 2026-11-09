import { getSql } from "./db";
import { isLocal, readRows, mutateRows } from "./local-store";

// Redirect가 성공하기 전에 클릭 사용량을 기록합니다.
export async function recordClick(shortCode) {
  if (isLocal()) { mutateRows(rows => { const row = rows.find(r => r.short_code === shortCode); if (row) { row.click_count++; row.last_clicked_at = new Date().toISOString(); } }); return; }
  const sql = getSql();
  await sql`
    UPDATE urls
    SET
      click_count = click_count + 1,
      last_clicked_at = NOW()
    WHERE short_code = ${shortCode}
  `;
}

// 전체 URL 수, 전체 클릭 수, 한 번 이상 클릭된 URL 수를 집계합니다.
export async function getSummaryStats() {
  if (isLocal()) { const rows = readRows(); return { totalUrls: rows.length, totalClicks: rows.reduce((n,r) => n + r.click_count, 0), clickedUrls: rows.filter(r => r.click_count > 0).length }; }
  const sql = getSql();
  const rows = await sql`
    SELECT
      COUNT(*) AS total_urls,
      COALESCE(SUM(click_count), 0) AS total_clicks,
      COUNT(*) FILTER (WHERE click_count > 0) AS clicked_urls
    FROM urls
  `;

  const row = rows[0];

  return {
    totalUrls: Number(row.total_urls),
    totalClicks: Number(row.total_clicks),
    clickedUrls: Number(row.clicked_urls),
  };
}

// 한 번 이상 클릭된 URL 가운데 클릭 수가 가장 많은 URL을 찾습니다.
export async function getTopUrl() {
  if (isLocal()) return (await getUrlStats()).find(r => r.clickCount > 0) ?? null;
  const sql = getSql();
  const rows = await sql`
    SELECT
      short_code,
      original_url,
      click_count
    FROM urls
    WHERE click_count > 0
    ORDER BY click_count DESC, created_at DESC
    LIMIT 1
  `;

  const row = rows[0];

  if (!row) {
    return null;
  }

  return {
    shortCode: row.short_code,
    originalUrl: row.original_url,
    clickCount: Number(row.click_count),
  };
}

// 관리자 화면에 표시할 URL별 사용량 정보를 가져옵니다.
export async function getUrlStats() {
  if (isLocal()) return readRows().sort((a,b) => b.click_count - a.click_count || b.created_at.localeCompare(a.created_at)).slice(0,50).map(r => ({ shortCode: r.short_code, originalUrl: r.original_url, clickCount: r.click_count, createdAt: r.created_at, lastClickedAt: r.last_clicked_at }));
  const sql = getSql();
  const rows = await sql`
    SELECT
      short_code,
      original_url,
      click_count,
      created_at,
      last_clicked_at
    FROM urls
    ORDER BY click_count DESC, created_at DESC
    LIMIT 50
  `;

  return rows.map((row) => ({
    shortCode: row.short_code,
    originalUrl: row.original_url,
    clickCount: Number(row.click_count),
    createdAt: row.created_at,
    lastClickedAt: row.last_clicked_at,
  }));
}

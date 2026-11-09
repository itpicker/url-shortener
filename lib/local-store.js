// 단일 로컬 서버 전용. 배포 시에는 Neon을 사용합니다.
import { mkdirSync, readFileSync, writeFileSync, renameSync } from "node:fs";
import path from "node:path";
const file = path.join(process.cwd(), ".data", "urls.json");
export function isLocal() {
  if (process.env.STORAGE_MODE !== "local") return false;
  if (process.env.VERCEL) throw new Error("Vercel에서는 DATABASE_URL을 설정하고 STORAGE_MODE=neon을 사용하세요.");
  return true;
}
export function readRows() {
  try { return JSON.parse(readFileSync(file, "utf8")); }
  catch (error) { if (error.code === "ENOENT") return []; throw error; }
}
export function mutateRows(update) {
  const rows = readRows(); update(rows);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file + ".tmp", JSON.stringify(rows, null, 2));
  renameSync(file + ".tmp", file);
}

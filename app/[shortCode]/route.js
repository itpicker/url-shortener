import { recordClick } from "../../lib/stats";
import { findUrlByShortCode } from "../../lib/db";

export async function GET(request, { params }) {
  const { shortCode } = await params;

  const originalUrl = await findUrlByShortCode(shortCode);

  if (!originalUrl) {
    console.warn("Short code not found", shortCode);
    return new Response("Not Found", { status: 404 });
  }
  try { await recordClick(shortCode); }
  catch (error) { console.error("Failed to record click", error); }

  return new Response(null, {
    status: 307,
    headers: {
      Location: originalUrl,
      "Cache-Control": "no-store",
    },
  });
}
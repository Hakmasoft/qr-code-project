export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    const match = url.pathname.match(/^\/c\/([a-z0-9-]+)$/);
    if (!match) {
      return fallback();
    }

    const slug = match[1];

    const row = await env.the_hub_db
      .prepare("SELECT destination, active FROM slugs WHERE slug = ?")
      .bind(slug)
      .first();

    if (!row || row.active !== 1) {
      return fallback();
    }

    const scanId = crypto.randomUUID();
    const deviceType = detectDevice(request.headers.get("user-agent") || "");
    const ipHash = await hashIp(request.headers.get("cf-connecting-ip") || "");
    const userAgent = request.headers.get("user-agent") || null;

    const logPromise = env.the_hub_db
      .prepare(
        "INSERT INTO scan_events (id, slug, device_type, ip_hash, user_agent) VALUES (?, ?, ?, ?, ?)"
      )
      .bind(scanId, slug, deviceType, ipHash, userAgent)
      .run()
      .catch((err) => {
        console.error("scan_event insert failed:", err.message);
      });

    ctx.waitUntil(logPromise);

    return Response.redirect(row.destination, 302);
  },
};

function fallback() {
  return new Response(
    "<!doctype html><html><body><h1>Almost there</h1><p>This link isn't active right now. Please try again later.</p></body></html>",
    {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
    }
  );
}

function detectDevice(ua) {
  const s = ua.toLowerCase();
  if (/mobile|android|iphone|ipod/.test(s)) return "mobile";
  if (/ipad|tablet/.test(s)) return "tablet";
  if (s) return "desktop";
  return "unknown";
}

async function hashIp(ip) {
  if (!ip) return null;
  const data = new TextEncoder().encode(ip);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
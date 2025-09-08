// Vercel Serverless Function for visit counting backed by Upstash Redis
// Requires env vars:
// - UPSTASH_REDIS_REST_URL
// - UPSTASH_REDIS_REST_TOKEN

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return res.status(500).json({ error: "Missing Redis credentials" });
  }

  const key = "visits:total";
  const endpoint = (cmd) => `${url}/${cmd}/${encodeURIComponent(key)}`;

  try {
    if (req.method === "POST") {
      const r = await fetch(endpoint("INCR"), {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const json = await r.json();
      return res.status(200).json({ value: Number(json.result) || 0 });
    }

    // GET returns current value; initialize if not exists
    const r = await fetch(endpoint("GET"), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const json = await r.json();
    if (json.result === null) {
      const set = await fetch(`${url}/SET/${encodeURIComponent(key)}/0`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      await set.json();
      return res.status(200).json({ value: 0 });
    }
    return res.status(200).json({ value: Number(json.result) || 0 });
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
}



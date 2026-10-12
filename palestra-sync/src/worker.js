// Server di sincronizzazione: conserva solo dati già cifrati dal browser.
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...CORS, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const m = url.pathname.match(/^\/api\/vault\/([0-9a-f]{64})$/);
    if (!m) return new Response('Not found', { status: 404 });
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    const key = 'v:' + m[1];

    if (req.method === 'GET') {
      const cur = await env.VAULT.get(key, 'json');
      return cur ? json(cur) : json(null, 404);
    }
    if (req.method === 'PUT') {
      const text = await req.text();
      if (text.length > 4_000_000) return json({ error: 'too big' }, 413);
      let j;
      try { j = JSON.parse(text); } catch { return json({ error: 'bad json' }, 400); }
      if (typeof j.d !== 'string' || typeof j.iv !== 'string') return json({ error: 'bad body' }, 400);
      const cur = await env.VAULT.get(key, 'json');
      if (cur && j.base !== cur.rev) return json(cur, 409); // qualcuno ha scritto nel frattempo: il client unisce e riprova
      const rec = { rev: Date.now() + '-' + crypto.randomUUID().slice(0, 8), d: j.d, iv: j.iv, z: j.z ? 1 : 0 };
      await env.VAULT.put(key, JSON.stringify(rec));
      return json({ rev: rec.rev });
    }
    return new Response('Method not allowed', { status: 405 });
  }
};

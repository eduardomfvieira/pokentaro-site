// Pokentaro — pedidos do totem para o painel do caixa
// Guarda os pedidos do dia no Redis (Upstash, conectado pela aba Storage da Vercel).
//   POST  /api/pedidos            { itens:[{n,d,q,p}], total, origem }  -> { numero, criadoEm }
//   GET   /api/pedidos            -> { data, pedidos:[...] }  (pedidos de hoje)
//   PATCH /api/pedidos            { numero, status }  status: "novo" | "concluido" | "cancelado"

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const LOJA = "ipanema";
const TTL = 60 * 60 * 24 * 3; // guarda 3 dias

async function redis(cmds) {
  const r = await fetch(URL_ + "/pipeline", {
    method: "POST",
    headers: { Authorization: "Bearer " + TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify(cmds),
  });
  if (!r.ok) throw new Error("redis " + r.status);
  const out = await r.json();
  const err = out.find((x) => x.error);
  if (err) throw new Error(err.error);
  return out.map((x) => x.result);
}

function hoje() {
  // data no fuso de São Paulo: AAAAMMDD
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  return p.replace(/-/g, "");
}

function limpa(s, n) {
  return String(s == null ? "" : s).slice(0, n);
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (!URL_ || !TOKEN) {
    return res.status(503).json({ erro: "Banco de dados não conectado. Conecte o Upstash Redis na aba Storage da Vercel e faça um novo deploy." });
  }
  const dia = hoje();
  const kSeq = `pk:${LOJA}:seq:${dia}`;
  const kPed = `pk:${LOJA}:pedidos:${dia}`;

  try {
    if (req.method === "POST") {
      const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
      const itens = Array.isArray(b.itens) ? b.itens.slice(0, 60) : [];
      if (!itens.length) return res.status(400).json({ erro: "Pedido vazio." });
      const limpos = itens.map((i) => ({
        n: limpa(i.n, 80),
        d: limpa(i.d, 400),
        q: Math.max(1, Math.min(99, parseInt(i.q, 10) || 1)),
        p: Math.round((Number(i.p) || 0) * 100) / 100,
      }));
      const total = Math.round(limpos.reduce((a, i) => a + i.q * i.p, 0) * 100) / 100;
      const [numero] = await redis([["INCR", kSeq], ["EXPIRE", kSeq, TTL]]);
      const pedido = { numero, itens: limpos, total, origem: limpa(b.origem || "totem", 20), status: "novo", criadoEm: Date.now() };
      await redis([["HSET", kPed, String(numero), JSON.stringify(pedido)], ["EXPIRE", kPed, TTL]]);
      return res.status(201).json({ numero, criadoEm: pedido.criadoEm });
    }

    if (req.method === "GET") {
      const [flat] = await redis([["HGETALL", kPed]]);
      const pedidos = [];
      for (let i = 1; i < (flat || []).length; i += 2) {
        try { pedidos.push(JSON.parse(flat[i])); } catch (e) {}
      }
      pedidos.sort((a, b) => a.numero - b.numero);
      return res.status(200).json({ data: dia, pedidos });
    }

    if (req.method === "PATCH") {
      const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
      const numero = String(parseInt(b.numero, 10));
      const status = ["novo", "concluido", "cancelado"].includes(b.status) ? b.status : null;
      if (!status || numero === "NaN") return res.status(400).json({ erro: "Dados inválidos." });
      const [raw] = await redis([["HGET", kPed, numero]]);
      if (!raw) return res.status(404).json({ erro: "Pedido não encontrado." });
      const p = JSON.parse(raw);
      p.status = status;
      p.atualizadoEm = Date.now();
      await redis([["HSET", kPed, numero, JSON.stringify(p)]]);
      return res.status(200).json(p);
    }

    res.setHeader("Allow", "GET, POST, PATCH");
    return res.status(405).json({ erro: "Método não permitido." });
  } catch (e) {
    return res.status(500).json({ erro: "Falha ao acessar o banco de dados.", detalhe: String(e.message || e) });
  }
};

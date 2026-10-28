// Cloudflare Pages Function.
// O Mercado Pago chama esse endereço a cada evento de pagamento.
//
// Fluxo:
//   1. confere a assinatura (x-signature) com MP_WEBHOOK_SECRET, para garantir que
//      a notificação veio mesmo do Mercado Pago;
//   2. busca o pagamento na API pelo id recebido. Nunca confia no status que vem
//      no corpo da notificação;
//   3. registra o resultado em log estruturado e, se RESEND_API_KEY e STORE_EMAIL
//      estiverem configurados, avisa a loja por e-mail quando o pagamento é aprovado.
//
// Variáveis de ambiente:
//   MP_ACCESS_TOKEN    -> token da API (o mesmo do criar-pagamento)
//   MP_WEBHOOK_SECRET  -> "assinatura secreta" do painel de webhooks do Mercado Pago
//   RESEND_API_KEY     -> opcional, para o e-mail de venda
//   STORE_EMAIL        -> opcional, quem recebe o e-mail de venda

// Tolerância para o horário da assinatura, contra reenvio de notificações antigas.
const MAX_AGE_SECONDS = 5 * 60;

// Lê o header x-signature: "ts=1704908010,v1=618c8534...".
export function parseSignature(header) {
  const parts = {};
  for (const piece of (header || "").split(",")) {
    const [key, value] = piece.split("=").map((s) => s && s.trim());
    if (key && value) parts[key] = value;
  }
  return parts.ts && parts.v1 ? { ts: parts.ts, v1: parts.v1 } : null;
}

async function hmacSha256Hex(secret, message) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Comparação em tempo constante, para não vazar a assinatura pelo tempo de resposta.
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Formato definido pelo Mercado Pago: "id:{data.id};request-id:{x-request-id};ts:{ts};"
// O id vai em minúsculas quando é alfanumérico.
export async function verifySignature({ secret, signatureHeader, requestId, dataId, now = Date.now() }) {
  const sig = parseSignature(signatureHeader);
  if (!secret || !sig || !dataId) return false;

  const ageSeconds = Math.abs(now / 1000 - Number(sig.ts) / (sig.ts.length > 10 ? 1000 : 1));
  if (!Number.isFinite(ageSeconds) || ageSeconds > MAX_AGE_SECONDS) return false;

  let manifest = `id:${String(dataId).toLowerCase()};`;
  if (requestId) manifest += `request-id:${requestId};`;
  manifest += `ts:${sig.ts};`;

  const expected = await hmacSha256Hex(secret, manifest);
  return safeEqual(expected, sig.v1);
}

async function fetchPayment(id, token) {
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(`Mercado Pago respondeu ${res.status} ao buscar o pagamento`);
  return res.json();
}

async function notifyStore(env, payment) {
  if (!env.RESEND_API_KEY || !env.STORE_EMAIL) return;
  const total = Number(payment.transaction_amount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Qualidade Única <onboarding@resend.dev>",
      to: env.STORE_EMAIL,
      subject: `Nova venda aprovada: pedido ${payment.external_reference || payment.id}`,
      text: `Pagamento ${payment.id} aprovado (${payment.payment_method_id}), total ${total}.`
    })
  });
}

function log(event, data) {
  console.log(JSON.stringify({ event, ...data }));
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  let body = null;
  try {
    body = await request.json();
  } catch (e) {
    // algumas notificações chegam só com query string, sem corpo JSON
  }

  const type = (body && body.type) || url.searchParams.get("type");
  const dataId = url.searchParams.get("data.id") || (body && body.data && body.data.id);

  // Só pagamentos interessam; outros tópicos são confirmados e ignorados.
  if (type !== "payment" || !dataId) {
    log("webhook_ignored", { type, dataId });
    return new Response("ok", { status: 200 });
  }

  const valid = await verifySignature({
    secret: env.MP_WEBHOOK_SECRET,
    signatureHeader: request.headers.get("x-signature"),
    requestId: request.headers.get("x-request-id"),
    dataId
  });
  if (!valid) {
    log("webhook_rejected", { reason: "invalid_signature", dataId });
    return new Response("invalid signature", { status: 401 });
  }

  try {
    const payment = await fetchPayment(dataId, env.MP_ACCESS_TOKEN);
    log("payment_checked", {
      paymentId: payment.id,
      orderId: payment.external_reference,
      status: payment.status,
      statusDetail: payment.status_detail,
      amount: payment.transaction_amount
    });
    if (payment.status === "approved") await notifyStore(env, payment);
    return new Response("ok", { status: 200 });
  } catch (err) {
    // 500 faz o Mercado Pago tentar de novo mais tarde
    log("payment_check_failed", { dataId, error: String(err && err.message) });
    return new Response("retry", { status: 500 });
  }
}

export async function onRequestGet() {
  return new Response("ok", { status: 200 });
}

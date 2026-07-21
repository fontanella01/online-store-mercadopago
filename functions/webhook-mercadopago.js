// Cloudflare Pages Function.
// O Mercado Pago chama esse endereço automaticamente a cada evento de pagamento.
// Por enquanto só registra o evento nos logs do Cloudflare (Workers Logs).
// Evolução futura: buscar o pagamento pelo ID recebido e enviar um e-mail de notificação
// (ex.: via API da Resend ou SendGrid) para avisar sobre a venda.

export async function onRequestPost(context) {
  const { request } = context;

  let payload = null;
  try {
    payload = await request.json();
  } catch (e) {
    // Mercado Pago às vezes manda como query string em vez de JSON — não é erro fatal.
  }

  console.log("Notificação Mercado Pago recebida:", JSON.stringify(payload));

  return new Response("ok", { status: 200 });
}

export async function onRequestGet(context) {
  return new Response("ok", { status: 200 });
}

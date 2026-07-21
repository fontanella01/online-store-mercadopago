// Cloudflare Pages Function.
// Fica acessível automaticamente em /criar-pagamento assim que o site é publicado.
// Precisa das variáveis de ambiente configuradas no painel do Cloudflare Pages:
//   MP_ACCESS_TOKEN -> Access Token do Mercado Pago (de teste ou de produção)
//   SITE_URL        -> URL do seu site, ex: https://qualidadeunica.com.br

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return jsonResponse({ error: "Corpo da requisição inválido" }, 400);
  }

  const { items, payer } = body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return jsonResponse({ error: "Carrinho vazio" }, 400);
  }

  if (!env.MP_ACCESS_TOKEN) {
    return jsonResponse({ error: "MP_ACCESS_TOKEN não configurado no ambiente" }, 500);
  }

  const siteUrl = env.SITE_URL || `${new URL(request.url).origin}`;

  const preference = {
    items: items.map(item => ({
      title: String(item.title).slice(0, 250),
      quantity: Number(item.quantity) || 1,
      currency_id: "BRL",
      unit_price: Number(item.unit_price)
    })),
    payer: payer ? {
      name: payer.nome,
      email: payer.email,
      phone: payer.telefone ? { number: payer.telefone } : undefined,
      address: payer.cep ? { zip_code: payer.cep } : undefined
    } : undefined,
    back_urls: {
      success: `${siteUrl}/confirmacao.html?status=success`,
      failure: `${siteUrl}/confirmacao.html?status=failure`,
      pending: `${siteUrl}/confirmacao.html?status=pending`
    },
    auto_return: "approved",
    notification_url: `${siteUrl}/webhook-mercadopago`
  };

  try {
    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.MP_ACCESS_TOKEN}`
      },
      body: JSON.stringify(preference)
    });

    const data = await mpResponse.json();

    if (!mpResponse.ok) {
      return jsonResponse({ error: data }, 500);
    }

    return jsonResponse({
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point
    });
  } catch (err) {
    return jsonResponse({ error: String(err) }, 500);
  }
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

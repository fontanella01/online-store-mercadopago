// Cloudflare Pages Function.
// Fica acessível automaticamente em /criar-pagamento assim que o site é publicado.
// Precisa das variáveis de ambiente configuradas no painel do Cloudflare Pages:
//   MP_ACCESS_TOKEN -> Access Token do Mercado Pago (de teste ou de produção)
//   SITE_URL        -> URL do seu site, ex: https://qualidadeunica.com.br

import { CATALOG, MAX_QUANTIDADE_POR_ITEM } from "./_catalog.js";

// Monta os itens do pagamento a partir do catálogo do servidor.
// O navegador manda só { id, quantity }: nome e preço vêm do CATALOG, então
// ninguém consegue alterar o valor cobrado editando a requisição.
export function buildItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Carrinho vazio" };
  }

  const result = [];
  for (const item of items) {
    const produto = CATALOG[item && item.id];
    if (!produto) {
      return { error: "Produto inválido" };
    }
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTIDADE_POR_ITEM) {
      return { error: "Quantidade inválida" };
    }
    result.push({
      id: item.id,
      title: produto.nome,
      quantity,
      currency_id: "BRL",
      unit_price: produto.precoVenda
    });
  }
  return { items: result };
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return jsonResponse({ error: "Corpo da requisição inválido" }, 400);
  }

  const { items, payer } = body || {};
  const built = buildItems(items);
  if (built.error) {
    return jsonResponse({ error: built.error }, 400);
  }

  if (!env.MP_ACCESS_TOKEN) {
    return jsonResponse({ error: "MP_ACCESS_TOKEN não configurado no ambiente" }, 500);
  }

  const siteUrl = env.SITE_URL || `${new URL(request.url).origin}`;

  const preference = {
    items: built.items,
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
      // o detalhe do erro fica no log do servidor; o cliente recebe uma mensagem genérica
      console.error("Erro do Mercado Pago:", JSON.stringify(data));
      return jsonResponse({ error: "Falha ao criar pagamento" }, 502);
    }

    return jsonResponse({
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point
    });
  } catch (err) {
    console.error("Erro ao chamar o Mercado Pago:", err);
    return jsonResponse({ error: "Falha ao criar pagamento" }, 502);
  }
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

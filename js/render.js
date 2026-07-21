// Funções que desenham o conteúdo de cada página.
// Cada página HTML chama só a função que precisa, no fim do <body>.

function productThumbHTML(produto) {
  if (produto.imagem) {
    return `<img src="${produto.imagem}" alt="${produto.nome}" style="width:100%;height:100%;object-fit:cover">`;
  }
  return `<span>Foto do produto<br>(${produto.nome})</span>`;
}

function renderProductGrid(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = PRODUCTS.map(p => `
    <div class="product-card">
      <a href="produto.html?id=${p.id}">
        <div class="product-thumb">${productThumbHTML(p)}</div>
      </a>
      <div class="product-info">
        <h3><a href="produto.html?id=${p.id}">${p.nome}</a></h3>
        <div class="price">${formatMoney(p.precoVenda)}</div>
        <p class="meta-line">Entrega: ${p.prazoEntrega}</p>
        <button class="btn" onclick="addToCart('${p.id}', 1); location.href='carrinho.html'">Comprar</button>
      </div>
    </div>
  `).join("");
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function renderProductDetail() {
  const id = getQueryParam("id");
  const produto = PRODUCTS.find(p => p.id === id);
  const container = document.getElementById("product-detail");
  if (!container) return;

  if (!produto) {
    container.innerHTML = `<div class="empty-state"><p>Produto não encontrado.</p><a class="btn btn-outline" href="index.html" style="width:auto;display:inline-flex;padding:10px 20px">Voltar para a loja</a></div>`;
    return;
  }

  document.title = produto.nome + " — Qualidade Única";

  container.innerHTML = `
    <div class="product-thumb">${productThumbHTML(produto)}</div>
    <div>
      <h1>${produto.nome}</h1>
      <div class="price" style="font-size:26px">${formatMoney(produto.precoVenda)}</div>
      <p class="meta-line">Prazo de entrega estimado: ${produto.prazoEntrega}</p>
      <p style="margin:18px 0">${produto.descricao}</p>
      <div class="qty-row">
        <label for="qty" style="margin:0">Quantidade</label>
        <input type="text" id="qty" value="1">
      </div>
      <button class="btn" id="add-to-cart-btn" style="max-width:260px">Adicionar ao carrinho</button>
      <p class="meta-line" style="margin-top:16px">
        Troca em até 7 dias após o recebimento, conforme o Código de Defesa do Consumidor.
        Veja nossa <a href="politica-de-troca.html" style="text-decoration:underline">política de troca</a>.
      </p>
    </div>
  `;

  document.getElementById("add-to-cart-btn").addEventListener("click", () => {
    const qty = document.getElementById("qty").value;
    addToCart(produto.id, qty);
    location.href = "carrinho.html";
  });
}

function renderCartPage() {
  const container = document.getElementById("cart-container");
  if (!container) return;
  const items = getCartDetailed();

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>Seu carrinho está vazio.</p>
        <a class="btn btn-outline" href="index.html" style="width:auto;display:inline-flex;padding:10px 20px">Ver produtos</a>
      </div>
    `;
    return;
  }

  const rows = items.map(item => `
    <tr>
      <td>${item.nome}</td>
      <td>
        <input type="text" style="width:50px;padding:6px;border:1px solid var(--border);border-radius:6px;text-align:center"
               value="${item.quantidade}" onchange="updateQuantity('${item.id}', this.value); renderCartPage();">
      </td>
      <td>${formatMoney(item.precoVenda)}</td>
      <td>${formatMoney(item.subtotal)}</td>
      <td><span class="remove-link" onclick="removeFromCart('${item.id}'); renderCartPage();">Remover</span></td>
    </tr>
  `).join("");

  const total = getCartTotal();

  container.innerHTML = `
    <table class="cart-table">
      <thead>
        <tr><th>Produto</th><th>Qtd</th><th>Preço</th><th>Subtotal</th><th></th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="summary-box">
      <div class="summary-row summary-total"><span>Total</span><span>${formatMoney(total)}</span></div>
      <a class="btn" style="margin-top:16px;display:flex" href="checkout.html">Finalizar compra</a>
    </div>
  `;
}

function renderCheckoutSummary() {
  const container = document.getElementById("checkout-summary");
  if (!container) return;
  const items = getCartDetailed();

  if (items.length === 0) {
    container.innerHTML = `<p>Seu carrinho está vazio. <a href="index.html" style="text-decoration:underline">Voltar para a loja</a>.</p>`;
    const form = document.getElementById("checkout-form");
    if (form) form.style.display = "none";
    return;
  }

  const rows = items.map(item => `
    <div class="summary-row"><span>${item.nome} x${item.quantidade}</span><span>${formatMoney(item.subtotal)}</span></div>
  `).join("");

  container.innerHTML = `
    ${rows}
    <div class="summary-row summary-total"><span>Total</span><span>${formatMoney(getCartTotal())}</span></div>
  `;
}

async function handleCheckoutSubmit(event) {
  event.preventDefault();
  const button = document.getElementById("checkout-submit");
  const errorBox = document.getElementById("checkout-error");
  errorBox.textContent = "";

  const items = getCartDetailed();
  if (items.length === 0) return;

  const payer = {
    nome: document.getElementById("nome").value.trim(),
    email: document.getElementById("email").value.trim(),
    telefone: document.getElementById("telefone").value.trim(),
    endereco: document.getElementById("endereco").value.trim(),
    cidade: document.getElementById("cidade").value.trim(),
    cep: document.getElementById("cep").value.trim()
  };

  if (!payer.nome || !payer.email || !payer.endereco || !payer.cidade || !payer.cep) {
    errorBox.textContent = "Preencha todos os campos obrigatórios.";
    return;
  }

  button.disabled = true;
  button.textContent = "Processando...";

  try {
    const response = await fetch("/criar-pagamento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map(item => ({
          title: item.nome,
          quantity: item.quantidade,
          unit_price: item.precoVenda
        })),
        payer
      })
    });

    const data = await response.json();

    if (!response.ok || !data.init_point) {
      throw new Error(data.error ? JSON.stringify(data.error) : "Falha ao criar pagamento");
    }

    // Guarda o pedido localmente antes de sair pro Mercado Pago, útil para a página de confirmação.
    sessionStorage.setItem("qu_last_order", JSON.stringify({ items, payer }));

    window.location.href = data.init_point || data.sandbox_init_point;
  } catch (err) {
    console.error(err);
    errorBox.textContent = "Não foi possível iniciar o pagamento. Tente novamente em instantes.";
    button.disabled = false;
    button.textContent = "Ir para o pagamento";
  }
}

function renderConfirmacao() {
  const container = document.getElementById("confirmacao-box");
  if (!container) return;
  const status = getQueryParam("status") || "pending";

  const map = {
    success: {
      titulo: "Pagamento aprovado",
      texto: "Seu pedido foi confirmado. Você vai receber os detalhes por e-mail.",
      cor: "var(--brand)"
    },
    approved: {
      titulo: "Pagamento aprovado",
      texto: "Seu pedido foi confirmado. Você vai receber os detalhes por e-mail.",
      cor: "var(--brand)"
    },
    pending: {
      titulo: "Pagamento em análise",
      texto: "Assim que for aprovado, avisamos por e-mail.",
      cor: "var(--ink-soft)"
    },
    failure: {
      titulo: "Pagamento não aprovado",
      texto: "Tente novamente com outro método de pagamento.",
      cor: "var(--ink-soft)"
    }
  };

  const info = map[status] || map.pending;

  container.innerHTML = `
    <h1 style="color:${info.cor}">${info.titulo}</h1>
    <p>${info.texto}</p>
    <a class="btn btn-outline" href="index.html" style="width:auto;display:inline-flex;padding:10px 20px;margin-top:20px">Voltar para a loja</a>
  `;

  if (status === "success" || status === "approved") {
    clearCart();
  }
}

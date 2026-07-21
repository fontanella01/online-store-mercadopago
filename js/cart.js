// Carrinho de compras usando localStorage do navegador.
// Formato salvo: [{ id, quantidade }]

const CART_KEY = "qu_cart";

function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(productId, quantidade) {
  quantidade = Math.max(1, parseInt(quantidade, 10) || 1);
  const cart = getCart();
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantidade += quantidade;
  } else {
    cart.push({ id: productId, quantidade });
  }
  saveCart(cart);
}

function updateQuantity(productId, quantidade) {
  quantidade = Math.max(1, parseInt(quantidade, 10) || 1);
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (item) {
    item.quantidade = quantidade;
    saveCart(cart);
  }
}

function removeFromCart(productId) {
  const cart = getCart().filter(item => item.id !== productId);
  saveCart(cart);
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartBadge();
}

function getCartItemCount() {
  return getCart().reduce((total, item) => total + item.quantidade, 0);
}

function getCartDetailed() {
  const cart = getCart();
  return cart
    .map(item => {
      const produto = PRODUCTS.find(p => p.id === item.id);
      if (!produto) return null;
      return {
        ...produto,
        quantidade: item.quantidade,
        subtotal: produto.precoVenda * item.quantidade
      };
    })
    .filter(Boolean);
}

function getCartTotal() {
  return getCartDetailed().reduce((total, item) => total + item.subtotal, 0);
}

function formatMoney(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function updateCartBadge() {
  const badge = document.querySelector("[data-cart-count]");
  if (badge) badge.textContent = getCartItemCount();
}

document.addEventListener("DOMContentLoaded", updateCartBadge);

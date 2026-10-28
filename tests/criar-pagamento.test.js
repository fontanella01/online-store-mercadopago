import { test } from "node:test";
import assert from "node:assert/strict";
import { buildItems } from "../functions/criar-pagamento.js";
import { CATALOG } from "../functions/_catalog.js";

test("usa o preço do catálogo do servidor, não o que vem do navegador", () => {
  const { items } = buildItems([{ id: "organizador-cabos", quantity: 2, unit_price: 0.01 }]);
  assert.equal(items[0].unit_price, CATALOG["organizador-cabos"].precoVenda);
  assert.equal(items[0].title, CATALOG["organizador-cabos"].nome);
  assert.equal(items[0].quantity, 2);
});

test("não envia custo nem fornecedor para o Mercado Pago", () => {
  const { items } = buildItems([{ id: "umidificador-portatil", quantity: 1 }]);
  assert.deepEqual(Object.keys(items[0]).sort(), ["currency_id", "id", "quantity", "title", "unit_price"]);
});

test("recusa carrinho vazio ou em formato errado", () => {
  assert.equal(buildItems([]).error, "Carrinho vazio");
  assert.equal(buildItems(null).error, "Carrinho vazio");
  assert.equal(buildItems("x").error, "Carrinho vazio");
});

test("recusa produto que não existe no catálogo", () => {
  assert.equal(buildItems([{ id: "produto-falso", quantity: 1 }]).error, "Produto inválido");
  assert.equal(buildItems([null]).error, "Produto inválido");
});

test("recusa quantidade fora de 1 a 20 ou não inteira", () => {
  for (const quantity of [0, -1, 21, 1.5, "abc", undefined]) {
    assert.equal(buildItems([{ id: "organizador-cabos", quantity }]).error, "Quantidade inválida", `quantity=${quantity}`);
  }
  assert.ok(buildItems([{ id: "organizador-cabos", quantity: "20" }]).items);
});

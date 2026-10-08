// Catálogo oficial usado pelo servidor (Cloudflare Pages Functions).
// Arquivos da pasta functions/ NÃO são publicados como estáticos, então os dados
// internos (custo, fornecedor) ficam protegidos aqui.
//
// IMPORTANTE: o preço cobrado do cliente é SEMPRE o precoVenda daqui, nunca o que
// vem do navegador. Ao mudar um preço, mude aqui e em js/products.js (que só serve
// para exibir os produtos no site).

export const CATALOG = {
  "massageador-pescoco": {
    nome: "Mini massageador elétrico de pescoço",
    precoVenda: 129.90,
    precoCusto: 45.00,
    fornecedor: "Fornecedor exemplo (trocar)",
    linkFornecedor: "#"
  },
  "umidificador-portatil": {
    nome: "Mini umidificador de ar USB",
    precoVenda: 79.90,
    precoCusto: 28.00,
    fornecedor: "Fornecedor exemplo (trocar)",
    linkFornecedor: "#"
  },
  "organizador-cabos": {
    nome: "Kit organizador magnético de cabos",
    precoVenda: 39.90,
    precoCusto: 12.00,
    fornecedor: "Fornecedor exemplo (trocar)",
    linkFornecedor: "#"
  },
  "luminaria-wireless": {
    nome: "Luminária de mesa com carregador wireless",
    precoVenda: 149.90,
    precoCusto: 55.00,
    fornecedor: "Fornecedor exemplo (trocar)",
    linkFornecedor: "#"
  }
};

export const MAX_QUANTIDADE_POR_ITEM = 20;

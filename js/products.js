// ATENÇÃO: dados de exemplo. Troque pelos produtos reais assim que decidir os 4-5 iniciais.
// Campos:
//   id            -> identificador único (usado na URL produto.html?id=...)
//   nome          -> nome exibido no site
//   precoVenda    -> preço que o cliente paga (R$)
//   precoCusto    -> quanto custa no fornecedor (uso interno, não aparece pro cliente)
//   descricao     -> texto da página de produto
//   fornecedor    -> nome do fornecedor (uso interno)
//   linkFornecedor-> link do produto no fornecedor (uso interno, pra você comprar quando vender)
//   prazoEntrega  -> texto mostrado ao cliente
//   imagem        -> URL da foto do produto (deixe null para usar o placeholder cinza)

const PRODUCTS = [
  {
    id: "massageador-pescoco",
    nome: "Mini massageador elétrico de pescoço",
    precoVenda: 129.90,
    precoCusto: 45.00,
    descricao: "Massageador portátil recarregável por USB, com 3 níveis de intensidade e calor. Alivia tensão muscular em minutos — ideal pra quem trabalha muito tempo sentado.",
    fornecedor: "Fornecedor exemplo (trocar)",
    linkFornecedor: "#",
    prazoEntrega: "10 a 18 dias úteis",
    imagem: null
  },
  {
    id: "umidificador-portatil",
    nome: "Mini umidificador de ar USB",
    precoVenda: 79.90,
    precoCusto: 28.00,
    descricao: "Umidificador compacto com luz LED noturna, ideal pra mesa de trabalho ou quarto. Reduz o ressecamento do ar e ajuda a dormir melhor.",
    fornecedor: "Fornecedor exemplo (trocar)",
    linkFornecedor: "#",
    prazoEntrega: "10 a 18 dias úteis",
    imagem: null
  },
  {
    id: "organizador-cabos",
    nome: "Kit organizador magnético de cabos",
    precoVenda: 39.90,
    precoCusto: 12.00,
    descricao: "Conjunto com 6 clipes magnéticos pra prender cabos de carregador, fone e mouse na mesa, sem bagunça. Fácil de instalar, sem fita adesiva permanente.",
    fornecedor: "Fornecedor exemplo (trocar)",
    linkFornecedor: "#",
    prazoEntrega: "7 a 15 dias úteis",
    imagem: null
  },
  {
    id: "luminaria-wireless",
    nome: "Luminária de mesa com carregador wireless",
    precoVenda: 149.90,
    precoCusto: 55.00,
    descricao: "Luminária LED com 3 tons de luz e base de carregamento sem fio integrada — carrega o celular enquanto ilumina a mesa. Regulagem de intensidade por toque.",
    fornecedor: "Fornecedor exemplo (trocar)",
    linkFornecedor: "#",
    prazoEntrega: "10 a 20 dias úteis",
    imagem: null
  }
];

// ATENÇÃO: dados de exemplo. Troque pelos produtos reais assim que decidir os 4-5 iniciais.
// Este arquivo é PÚBLICO (qualquer visitante consegue ler). Só coloque aqui o que o
// cliente pode ver. Custo, fornecedor e o preço oficial cobrado ficam em functions/_catalog.js.
// Ao mudar um preço, mude nos dois arquivos.
// Campos:
//   id            -> identificador único (usado na URL produto.html?id=...)
//   nome          -> nome exibido no site
//   precoVenda    -> preço que o cliente paga (R$)
//   descricao     -> texto da página de produto
//   prazoEntrega  -> texto mostrado ao cliente
//   imagem        -> URL da foto do produto (deixe null para usar o placeholder cinza)

const PRODUCTS = [
  {
    id: "massageador-pescoco",
    nome: "Mini massageador elétrico de pescoço",
    precoVenda: 129.90,
    descricao: "Massageador portátil recarregável por USB, com 3 níveis de intensidade e calor. Alivia tensão muscular em minutos — ideal pra quem trabalha muito tempo sentado.",
    prazoEntrega: "10 a 18 dias úteis",
    imagem: null
  },
  {
    id: "umidificador-portatil",
    nome: "Mini umidificador de ar USB",
    precoVenda: 79.90,
    descricao: "Umidificador compacto com luz LED noturna, ideal pra mesa de trabalho ou quarto. Reduz o ressecamento do ar e ajuda a dormir melhor.",
    prazoEntrega: "10 a 18 dias úteis",
    imagem: null
  },
  {
    id: "organizador-cabos",
    nome: "Kit organizador magnético de cabos",
    precoVenda: 39.90,
    descricao: "Conjunto com 6 clipes magnéticos pra prender cabos de carregador, fone e mouse na mesa, sem bagunça. Fácil de instalar, sem fita adesiva permanente.",
    prazoEntrega: "7 a 15 dias úteis",
    imagem: null
  },
  {
    id: "luminaria-wireless",
    nome: "Luminária de mesa com carregador wireless",
    precoVenda: 149.90,
    descricao: "Luminária LED com 3 tons de luz e base de carregamento sem fio integrada — carrega o celular enquanto ilumina a mesa. Regulagem de intensidade por toque.",
    prazoEntrega: "10 a 20 dias úteis",
    imagem: null
  }
];

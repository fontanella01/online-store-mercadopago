# Qualidade Única — site da loja

Site simples em HTML/CSS/JS puro (sem framework), com pagamento via Mercado Pago Checkout Pro.
Não precisa instalar nada nem rodar `npm install` — é só publicar os arquivos.

## Estrutura

```
index.html              -> página inicial + catálogo
produto.html            -> página de um produto (ex: produto.html?id=produto-1)
carrinho.html           -> carrinho de compras
checkout.html           -> formulário de dados + botão de pagamento
confirmacao.html        -> página de retorno do Mercado Pago
politica-de-troca.html  -> obrigatória pelo Código de Defesa do Consumidor
termos.html
privacidade.html        -> obrigatória pela LGPD
css/style.css           -> todo o visual do site (cor principal em --brand)
js/products.js          -> lista de produtos (EDITE AQUI para trocar produtos)
js/cart.js              -> lógica do carrinho (não precisa mexer)
js/render.js            -> lógica de cada página (não precisa mexer)
functions/criar-pagamento.js     -> cria o pagamento no Mercado Pago
functions/webhook-mercadopago.js -> recebe aviso de pagamento do Mercado Pago
```

## 1. Trocar os produtos

Abra `js/products.js` e edite a lista `PRODUCTS`. Cada produto tem:
nome, preço de venda, preço de custo (uso interno), descrição, fornecedor, prazo de entrega.
Salve o arquivo — não precisa mais nada, o site lê direto dali.

Fotos: por enquanto os produtos aparecem com um retângulo cinza no lugar da foto.
Quando tiver as imagens reais, hospede-as (ex: numa pasta `imagens/` dentro deste projeto)
e preencha o campo `imagem` de cada produto com o caminho do arquivo.

## 2. Criar conta no Mercado Pago

1. Crie uma conta em mercadopago.com.br (grátis).
2. Vá em "Seu negócio" > "Configurações" > "Credenciais" (ou acesse o painel de desenvolvedores).
3. Copie o **Access Token** — primeiro use o de **teste** (sandbox) para validar tudo antes de ligar o modo real.
4. Nunca compartilhe login/senha da conta — só o Access Token é necessário para a integração.

## 3. Publicar no Cloudflare Pages

1. Crie uma conta gratuita em pages.cloudflare.com.
2. Suba esta pasta para um repositório no GitHub (crie uma conta gratuita em github.com se ainda não tiver).
3. No Cloudflare Pages, clique em "Create a project" > "Connect to Git" e selecione o repositório.
4. Em "Build settings": Framework preset = "None", Build command = (deixe em branco), Output directory = `/`.
5. Em "Environment variables", adicione:
   - `MP_ACCESS_TOKEN` = o Access Token do Mercado Pago (comece com o de teste)
   - `SITE_URL` = a URL que o Cloudflare vai gerar (ex: https://qualidade-unica.pages.dev) — depois troque pelo domínio próprio
6. Clique em "Save and Deploy".

## 4. Conectar o domínio próprio

No projeto já publicado, vá em "Custom domains" > "Set up a custom domain" e siga as instruções
(vai pedir pra apontar o DNS do domínio que você comprou pra Cloudflare).

## 5. Testar antes de vender de verdade

Com o Access Token de teste configurado, faça uma compra completa no site publicado.
O Mercado Pago vai simular o pagamento sem cobrar nada de verdade.
Só depois de confirmar que o fluxo completo funciona (compra > pagamento > confirmação),
troque o `MP_ACCESS_TOKEN` pelo Access Token de **produção** no painel do Cloudflare Pages.

## Observação sobre estoque/fornecedor

Este site não faz o pedido automático no fornecedor. Quando cair uma venda, você recebe
o pedido (por enquanto, só aparece nos logs do Cloudflare em "webhook-mercadopago" —
uma notificação por e-mail pode ser adicionada depois) e faz a compra manualmente
no fornecedor, usando o endereço do cliente informado no checkout.

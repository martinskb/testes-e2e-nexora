# Testes E2E do Nexora

Testes de ponta a ponta com **Playwright** para o [Nexora](https://github.com/martinskb/nexora), um sistema de vendas e estoque para pequenos comércios ([demo](https://nexora-app-eosin.vercel.app)).

Os testes abrem o navegador, usam o sistema como um lojista usaria e conferem o resultado na tela: cadastrar produto, vender, cancelar a venda e ver o estoque voltar.

![Testes E2E](https://github.com/martinskb/testes-e2e-nexora/actions/workflows/e2e.yml/badge.svg)

## O que é testado

| Área | Cenário |
|---|---|
| Conta | Criar a conta pela tela e entrar no painel |
| Conta | Sair e entrar de novo com e-mail e senha |
| Conta | Senha errada não entra e mostra aviso |
| Conta | Página interna sem login manda para a tela de entrar |
| Produtos | Cadastrar produto e ver preço e estoque na lista |
| Produtos | Não deixa cadastrar sem nome |
| Produtos | Uma loja não vê os produtos de outra (isolamento) |
| Vendas | Vender 2 de 3 unidades deixa 1 no estoque |
| Vendas | Não deixa vender mais do que tem no estoque |
| Vendas | Cancelar a venda devolve os itens ao estoque |
| Celular | Login pelo Enter do teclado (Pixel 7 emulado) |
| Celular | Erro de senha curta na tela de criar conta |
| Celular | **Bug encontrado**: tocar em "Entrar" com o teclado aberto não faz login (ver abaixo) |

## Bug encontrado pelos testes

No celular, quando um campo está em foco (teclado aberto), o painel de cima da tela de login encolhe para dar espaço. Ao tocar em **Entrar**, o campo perde o foco primeiro, o painel volta ao tamanho normal e empurra o botão para baixo **antes de o toque terminar**. O toque cai fora do botão e nada acontece. Pelo Enter do teclado funciona.

O teste está marcado com `test.fail()`: a suíte continua verde e o Playwright avisa quando o bug for corrigido (o teste passa a "falhar ao falhar").

## Decisões

- **Cada teste cria a própria loja**, com e-mail único. Um teste não depende do outro, e eles rodam em paralelo.
- **Conta criada pela API** na fixture `loja` (`tests/apoio/fixtures.js`), porque é mais rápido. O fluxo de criar conta pela tela tem um teste próprio.
- **Seletores por papel e rótulo** (`getByRole`, `getByLabel`), como um usuário enxerga a tela. Nada de classes CSS, que mudam a cada build.
- **Banco só para os testes**: um MariaDB na porta 3307, dentro da pasta do projeto. Não toca no banco de desenvolvimento nem no de produção.
- **Esperas pelo que o usuário vê** (ex.: a mensagem "Venda de R$ 25,90 registrada.") em vez de `waitForTimeout`.

## Como rodar

Requisitos: Node.js 20+, MariaDB instalado e o Nexora clonado ao lado desta pasta (`../nexora`, ou indique o caminho em `NEXORA_DIR`).

```bash
npm install
npx playwright install chromium
./scripts/banco-local.sh        # sobe o MariaDB de teste na porta 3307
npx playwright test             # sobe o backend e o frontend do Nexora sozinho
npx playwright show-report      # relatório com prints e trace das falhas
```

No GitHub Actions, o MariaDB roda como serviço e o relatório fica disponível como artefato da execução.

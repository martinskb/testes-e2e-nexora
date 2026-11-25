import { test as base, expect } from '@playwright/test'

/** Gera dados únicos para cada teste não depender de outro. */
export function novaLoja(prefixo = 'Loja') {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  return { nome: `${prefixo} ${id}`, email: `e2e-${id}@teste.dev`, senha: 'senha-forte-123' }
}

export const test = base.extend({
  /**
   * Loja nova já logada. A conta é criada pela API (mais rápido que pela tela);
   * o cookie de sessão fica no mesmo contexto do navegador do teste.
   */
  loja: async ({ page }, use) => {
    const loja = novaLoja()
    const r = await page.request.post('/api/auth/cadastro', { data: loja })
    expect(r.ok(), await r.text()).toBeTruthy()
    await use(loja)
  },
})

export { expect }

/** Cadastra um produto pela tela de Produtos. */
export async function cadastrarProduto(page, { nome, preco, quantidade }) {
  await page.goto('/produtos')
  await page.getByRole('button', { name: /Cadastrar primeiro produto|Produto$/ }).first().click()
  await page.getByLabel('Nome do produto').fill(nome)
  await page.getByLabel('Preço de venda').fill(preco)
  await page.getByLabel('Quantidade em estoque').fill(String(quantidade))
  await page.getByRole('button', { name: 'Cadastrar produto' }).click()
  await expect(page.getByText(`"${nome}" cadastrado.`)).toBeVisible()
}

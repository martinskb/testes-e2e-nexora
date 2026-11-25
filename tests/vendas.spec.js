import { test, expect, cadastrarProduto } from './apoio/fixtures.js'

test.describe('Vendas e estoque', () => {
  test.beforeEach(async ({ page, loja }) => {
    await cadastrarProduto(page, { nome: 'Arroz 5kg', preco: '25,90', quantidade: 3 })
  })

  test('vender 2 unidades baixa o estoque de 3 para 1', async ({ page }) => {
    await page.goto('/vender')
    await page.getByRole('button', { name: /^Adicionar Arroz 5kg/ }).click()
    await page.getByRole('button', { name: 'Aumentar Arroz 5kg' }).click()
    await expect(page.getByText('R$ 51,80').first()).toBeVisible()
    await page.getByRole('button', { name: /Confirmar venda/ }).click()
    await expect(page.getByText('Venda de R$ 51,80 registrada.')).toBeVisible()

    await page.goto('/produtos')
    await expect(page.getByRole('button', { name: /Arroz 5kg/ })).toContainText('1 un')
  })

  test('não deixa vender mais do que tem no estoque', async ({ page }) => {
    await page.goto('/vender')
    await page.getByRole('button', { name: /^Adicionar Arroz 5kg/ }).click()
    for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Aumentar Arroz 5kg' }).click()

    const aviso = page.getByRole('dialog')
    await expect(aviso).toContainText('O sistema mostra 3 unidades de Arroz 5kg, mas a venda precisa de 4.')
    await aviso.getByRole('button', { name: 'Cancelar' }).click()
    await expect(page.getByLabel('Quantidade de Arroz 5kg')).toHaveValue('3')
  })

  test('cancelar a venda devolve os itens ao estoque', async ({ page }) => {
    await page.goto('/vender')
    await page.getByRole('button', { name: /^Adicionar Arroz 5kg/ }).click()
    await page.getByRole('button', { name: /Confirmar venda/ }).click()
    await expect(page.getByText('Venda de R$ 25,90 registrada.')).toBeVisible()

    await page.goto('/vendas')
    await page.getByRole('button', { name: /Ver venda das .* Arroz 5kg/ }).click()
    const detalhes = page.getByRole('dialog', { name: 'Detalhes da venda' })
    await detalhes.getByRole('button', { name: 'Cancelar esta venda' }).click()
    await detalhes.getByLabel('Motivo').fill('Cliente desistiu')
    await detalhes.getByRole('button', { name: 'Cancelar venda' }).click()
    await expect(page.getByText(/Os itens voltaram ao/).first()).toBeVisible()

    await page.goto('/produtos')
    await expect(page.getByRole('button', { name: /Arroz 5kg/ })).toContainText('3 un')
  })
})

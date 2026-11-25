import { test, expect, cadastrarProduto, novaLoja } from './apoio/fixtures.js'

test.describe('Produtos', () => {
  test('cadastra um produto e ele aparece na lista com preço e estoque', async ({ page, loja }) => {
    await cadastrarProduto(page, { nome: 'Arroz 5kg', preco: '25,90', quantidade: 3 })

    const item = page.getByRole('button', { name: /Arroz 5kg/ })
    await expect(item).toContainText('3 un')
    await expect(item).toContainText('R$ 25,90')
  })

  test('não deixa cadastrar sem nome', async ({ page, loja }) => {
    await page.goto('/produtos')
    await page.getByRole('button', { name: 'Cadastrar primeiro produto' }).click()
    await page.getByLabel('Preço de venda').fill('10,00')
    await page.getByLabel('Quantidade em estoque').fill('1')
    await page.getByRole('button', { name: 'Cadastrar produto' }).click()

    await expect(page.getByLabel('Nome do produto')).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByText('Nenhum produto ainda')).toBeVisible()
  })

  test('uma loja não vê os produtos de outra', async ({ page, loja, browser }) => {
    await cadastrarProduto(page, { nome: 'Produto secreto', preco: '5,00', quantidade: 1 })

    const outra = await browser.newContext({ baseURL: 'http://localhost:5173' })
    const pagina = await outra.newPage()
    const r = await pagina.request.post('/api/auth/cadastro', { data: novaLoja('Outra') })
    expect(r.ok()).toBeTruthy()
    await pagina.goto('/produtos')
    await expect(pagina.getByText('Nenhum produto ainda')).toBeVisible()
    await expect(pagina.getByText('Produto secreto')).toHaveCount(0)
    await outra.close()
  })
})

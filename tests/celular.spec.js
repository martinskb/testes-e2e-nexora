import { test, expect, novaLoja } from './apoio/fixtures.js'

test.describe('No celular', () => {
  test('entra pela tela de login usando o Enter do teclado', async ({ page, loja }) => {
    await page.context().clearCookies()
    await page.goto('/entrar')
    await page.getByLabel('E-mail').fill(loja.email)
    await page.getByRole('textbox', { name: 'Senha' }).fill(loja.senha)
    await page.getByRole('textbox', { name: 'Senha' }).press('Enter')
    await expect(page).toHaveURL('/')
  })

  // Regressão de um bug encontrado por este teste (25/11/2026): com o teclado
  // aberto, tocar em "Entrar" tirava o foco do campo, o painel de cima crescia e
  // empurrava o botão para longe do dedo. Corrigido no LayoutAuth.jsx do Nexora.
  test('tocar no botão Entrar com o teclado aberto faz o login', async ({ page, loja }) => {
    await page.context().clearCookies()
    await page.goto('/entrar')
    await page.getByLabel('E-mail').fill(loja.email)
    await page.getByRole('textbox', { name: 'Senha' }).fill(loja.senha)
    await page.getByRole('button', { name: 'Entrar' }).tap()
    await expect(page).toHaveURL('/', { timeout: 5_000 })
  })

  test('tela de criar conta mostra o erro de senha curta', async ({ page }) => {
    const loja = novaLoja()
    await page.goto('/criar-conta')
    await page.getByLabel('Nome da loja').fill(loja.nome)
    await page.getByLabel('E-mail').fill(loja.email)
    await page.getByRole('textbox', { name: 'Senha' }).fill('123')
    await page.getByRole('textbox', { name: 'Senha' }).press('Enter')
    await expect(page.getByRole('textbox', { name: 'Senha' })).toHaveAttribute('aria-invalid', 'true')
    await expect(page).toHaveURL(/criar-conta/)
  })
})

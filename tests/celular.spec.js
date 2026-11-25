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

  // BUG encontrado por este teste (25/11/2026):
  // no celular, com o campo em foco ("teclado aberto"), o painel de cima encolhe
  // (LayoutAuth.module.css, `.pagina:has(input:focus)`). Ao tocar em "Entrar",
  // o campo perde o foco, o painel volta a crescer e empurra o botão para baixo
  // antes do toque terminar. O toque cai fora do botão e nada acontece.
  // test.fail() mantém a suíte verde e avisa quando o bug for corrigido.
  test.fail('tocar no botão Entrar com o teclado aberto faz o login', async ({ page, loja }) => {
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

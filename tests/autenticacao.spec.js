import { test, expect, novaLoja } from './apoio/fixtures.js'

test.describe('Conta da loja', () => {
  test('cria a conta pela tela e entra no painel', async ({ page }) => {
    const loja = novaLoja('Mercadinho')
    await page.goto('/criar-conta')
    await page.getByLabel('Nome da loja').fill(loja.nome)
    await page.getByLabel('E-mail').fill(loja.email)
    await page.getByRole('textbox', { name: 'Senha' }).fill(loja.senha)
    await page.getByRole('button', { name: /Criar/ }).click()

    await expect(page).toHaveURL('/')
    await expect(page.getByText(loja.nome).first()).toBeVisible()
  })

  test('sai da conta e entra de novo com e-mail e senha', async ({ page, loja }) => {
    await page.goto('/minha-loja')
    await page.getByRole('button', { name: 'Sair da conta' }).click()
    await expect(page).toHaveURL(/\/entrar/)

    await page.getByLabel('E-mail').fill(loja.email)
    await page.getByRole('textbox', { name: 'Senha' }).fill(loja.senha)
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page).toHaveURL('/')
    await expect(page.getByText(loja.nome).first()).toBeVisible()
  })

  test('senha errada não entra e mostra um aviso', async ({ page, loja }) => {
    await page.context().clearCookies()
    await page.goto('/entrar')
    await page.getByLabel('E-mail').fill(loja.email)
    await page.getByRole('textbox', { name: 'Senha' }).fill('senha-errada-999')
    await page.getByRole('button', { name: 'Entrar' }).click()

    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page).toHaveURL(/\/entrar/)
  })

  test('página interna sem login manda para a tela de entrar', async ({ page }) => {
    await page.goto('/produtos')
    await expect(page).toHaveURL(/\/entrar/)
  })
})

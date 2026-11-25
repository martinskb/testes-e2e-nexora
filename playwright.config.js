// @ts-check
import { defineConfig, devices } from '@playwright/test'
import path from 'node:path'

// Pasta do projeto Nexora (https://github.com/martinskb/nexora).
const NEXORA = process.env.NEXORA_DIR ?? path.resolve('../nexora')

// O backend roda contra o banco de teste do scripts/banco-local.sh (porta 3307).
const envBackend = {
  NODE_ENV: 'development',
  PORT: '3333',
  CORS_ORIGIN: 'http://localhost:5173',
  DB_HOST: '127.0.0.1',
  DB_PORT: process.env.E2E_DB_PORT ?? '3307',
  DB_USER: 'nexora',
  DB_PASSWORD: 'e2e',
  DB_NAME: 'nexora_e2e',
  JWT_SECRET: 'segredo-usado-apenas-nos-testes-e2e-locais',
  SESSAO_DIAS: '1',
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5173',
    locale: 'pt-BR',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] }, testIgnore: /celular\.spec/ },
    // O Nexora é usado no celular do lojista: estes testes rodam num Pixel 7 emulado.
    { name: 'celular', use: { ...devices['Pixel 7'] }, testMatch: /celular\.spec/ },
  ],
  webServer: [
    {
      command: 'node scripts/db-setup.js && node src/server.js',
      cwd: path.join(NEXORA, 'backend'),
      env: envBackend,
      url: 'http://localhost:3333/api/health',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: 'npx vite --port 5173 --strictPort',
      cwd: path.join(NEXORA, 'frontend'),
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
})

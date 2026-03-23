import type { Page } from '@playwright/test'

const MOCK_URL = 'http://localhost:3001'

export async function login(page: Page) {
  await page.goto('/login')
  await page.getByTestId('input-usuario').fill('admin')
  await page.getByTestId('input-password').fill('admin123')
  await page.getByTestId('boton-ingresar').click()
  // Esperar el menú lateral (indica login exitoso) en vez de waitForURL('/')
  // porque Playwright trata URLs con/sin trailing slash como distintas
  await page.getByTestId('menu-lateral').waitFor({ state: 'visible' })
}

export async function setScenario(scenario: string) {
  await fetch(`${MOCK_URL}/_set-scenario`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenario })
  })
}

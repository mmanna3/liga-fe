import type { Page } from '@playwright/test'

const MOCK_URL = 'http://localhost:3001'

async function loginConCredenciales(
  page: Page,
  usuario: string,
  password: string
) {
  await page.goto('/login')
  await page.getByTestId('input-usuario').fill(usuario)
  await page.getByTestId('input-password').fill(password)
  await page.getByTestId('boton-ingresar').click()
  await page.getByTestId('menu-lateral').waitFor({ state: 'visible' })
}

export async function login(page: Page) {
  await loginConCredenciales(page, 'admin', 'admin123')
}

export async function loginAsConsulta(page: Page) {
  await loginConCredenciales(page, 'consulta', 'consulta123')
}

export async function loginAsUsuarioSinPermisos(page: Page) {
  await loginConCredenciales(page, 'sinperm', 'clave123')
}

export async function loginAsUsuarioSoloTorneos(page: Page) {
  await loginConCredenciales(page, 'solo-torneos', 'clave123')
}

export async function loginAsUsuarioSoloTorneosControlTotal(page: Page) {
  await loginConCredenciales(page, 'solo-torneos-ct', 'clave123')
}

export async function loginAsSuperAdmin(page: Page) {
  await loginConCredenciales(page, 'superadmin', 'clave123')
}

export async function setScenario(scenario: string) {
  await fetch(`${MOCK_URL}/_set-scenario`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenario })
  })
}

import { expect, test } from '@playwright/test'
import { setScenario } from './helpers'

test.describe('Login', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeEach(async () => {
    await setScenario('happy')
  })

  test('muestra la pantalla de login', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Iniciar Sesión')).toBeVisible()
    await expect(page.getByTestId('input-usuario')).toBeVisible()
    await expect(page.getByTestId('input-password')).toBeVisible()
    await expect(page.getByTestId('boton-ingresar')).toBeVisible()
  })

  test('login exitoso muestra el menú y el logo', async ({ page }) => {
    await page.goto('/login')

    await page.getByTestId('input-usuario').fill('admin')
    await page.getByTestId('input-password').fill('admin123')
    await page.getByTestId('boton-ingresar').click()

    // Después del login exitoso el menú lateral es visible
    // (no usamos waitForURL porque Playwright trata trailing slash como URL distinta)
    await page.getByTestId('menu-lateral').waitFor({ state: 'visible' })

    // El menú lateral es visible
    await expect(page.getByTestId('menu-lateral')).toBeVisible()

    // Las secciones principales del menú están accesibles
    await expect(page.getByTestId('nav-torneos')).toBeVisible()
    await expect(page.getByTestId('nav-clubes')).toBeVisible()
    await expect(page.getByTestId('nav-equipos')).toBeVisible()
    await expect(page.getByTestId('nav-jugadores')).toBeVisible()
    await expect(page.getByTestId('nav-delegados')).toBeVisible()

    // El logo de la liga es visible en la pantalla home
    await expect(
      page.getByAltText('Encuentro Deportivo de Fútbol Infantil')
    ).toBeVisible()
  })

  test('credenciales inválidas muestra error', async ({ page }) => {
    // Cambiar escenario del mock server
    await fetch('http://localhost:3001/_set-scenario', {
      method: 'POST',
      body: JSON.stringify({ scenario: 'credenciales_invalidas' })
    })

    await page.goto('/login')
    await page.getByTestId('input-usuario').fill('admin')
    await page.getByTestId('input-password').fill('mal-password')
    await page.getByTestId('boton-ingresar').click()

    await expect(
      page.getByText('Usuario o contraseña incorrectos')
    ).toBeVisible()

    // Restablecer escenario
    await fetch('http://localhost:3001/_set-scenario', {
      method: 'POST',
      body: JSON.stringify({ scenario: 'happy' })
    })
  })
})

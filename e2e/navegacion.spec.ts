import { expect, test } from '@playwright/test'
import { login, setScenario } from './helpers'

test.describe('Navegación', () => {
  test.beforeEach(async () => {
    await setScenario('happy')
  })
  test.afterEach(async () => {
    await setScenario('happy')
  })

  test('ruta protegida redirige a login si no hay sesión', async ({ page }) => {
    await page.goto('/clubs')
    await page.waitForURL('/login')
    await expect(page.getByText('Iniciar Sesión')).toBeVisible()
  })

  test('ruta raíz redirige a login si no hay sesión', async ({ page }) => {
    await page.goto('/')
    await page.waitForURL('/login')
  })

  test('menú lateral navega a cada sección', async ({ page }) => {
    await login(page)

    await page.getByTestId('nav-clubes').click()
    await expect(page).toHaveURL('/clubs')

    await page.getByTestId('nav-jugadores').click()
    await expect(page).toHaveURL('/jugadores')

    await page.getByTestId('nav-equipos').click()
    await expect(page).toHaveURL('/equipos')

    await page.getByTestId('nav-delegados').click()
    await expect(page).toHaveURL('/delegados')

    await page.getByTestId('nav-torneos').click()
    await expect(page).toHaveURL('/torneos')
  })

  test('el nombre y rol del usuario se muestran en el menú', async ({ page }) => {
    await login(page)
    await expect(page.getByTestId('menu-lateral')).toContainText('Admin E2E')
    await expect(page.getByTestId('menu-lateral')).toContainText('Administrador')
  })
})

import { expect, test } from '@playwright/test'
import { login, setScenario } from './helpers'

test.describe('Torneos', () => {
  test.beforeEach(async () => {
    await setScenario('happy')
  })
  test.afterEach(async () => {
    await setScenario('happy')
  })

  test('muestra mensaje vacío cuando no hay torneos', async ({ page }) => {
    await login(page)
    await page.goto('/torneos')

    await expect(
      page.getByText('No hay torneos para el año seleccionado')
    ).toBeVisible()
  })

  test('muestra torneos cuando hay datos', async ({ page }) => {
    await setScenario('torneos_con_datos')
    await login(page)
    await page.goto('/torneos')

    await expect(page.getByText('Torneo Apertura 2026')).toBeVisible()
  })

  test('navega a la pantalla de crear torneo', async ({ page }) => {
    await login(page)
    await page.goto('/torneos/crear')

    await expect(page.getByText('Crear Torneo')).toBeVisible()
  })
})

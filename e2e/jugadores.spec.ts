import { expect, test } from '@playwright/test'
import { login, setScenario } from './helpers'

test.describe('Jugadores', () => {
  test.beforeEach(async () => {
    await setScenario('happy')
  })
  test.afterEach(async () => {
    await setScenario('happy')
  })

  test('muestra lista vacía cuando no hay jugadores', async ({ page }) => {
    await login(page)
    await page.goto('/jugadores')

    await expect(page.getByText('No se encontraron resultados.')).toBeVisible()
    await expect(page.getByText('Registros: 0')).toBeVisible()
  })

  test('muestra jugadores en la tabla cuando hay datos', async ({ page }) => {
    await setScenario('jugadores_con_datos')
    await login(page)
    await page.goto('/jugadores')

    await expect(page.getByText('Juan')).toBeVisible()
    await expect(page.getByText('González')).toBeVisible()
    await expect(page.getByText('12345678')).toBeVisible()
    await expect(page.getByText('Registros: 1')).toBeVisible()
  })

  test('navega al detalle del jugador al hacer click en la fila', async ({ page }) => {
    await setScenario('jugadores_con_datos')
    await login(page)
    await page.goto('/jugadores')

    await page.getByText('González').click()

    await page.waitForURL(/\/jugadores\/detalle\/\d+/)
  })
})

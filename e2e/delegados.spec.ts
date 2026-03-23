import { expect, test } from '@playwright/test'
import { login, setScenario } from './helpers'

test.describe('Delegados', () => {
  test.beforeEach(async () => {
    await setScenario('happy')
  })
  test.afterEach(async () => {
    await setScenario('happy')
  })

  test('muestra lista vacía cuando no hay delegados', async ({ page }) => {
    await login(page)
    await page.goto('/delegados')

    await expect(page.getByText('No se encontraron resultados.')).toBeVisible()
    await expect(page.getByText('Registros: 0')).toBeVisible()
  })

  test('muestra delegados en la tabla cuando hay datos', async ({ page }) => {
    await setScenario('delegados_con_datos')
    await login(page)
    await page.goto('/delegados')

    await expect(page.getByText('carlos.martinez')).toBeVisible()
    await expect(page.getByText('Carlos', { exact: true })).toBeVisible()
    await expect(page.getByText('Martínez', { exact: true })).toBeVisible()
    await expect(page.getByText('Registros: 1')).toBeVisible()
  })

  test('navega al detalle del delegado al hacer click en la fila', async ({ page }) => {
    await setScenario('delegados_con_datos')
    await login(page)
    await page.goto('/delegados')

    await page.getByText('carlos.martinez').click()

    await page.waitForURL(/\/delegados\/detalle\/\d+/)
  })
})

import { expect, test } from '@playwright/test'
import { login, setScenario } from './helpers'

test.describe('Grupos de fases', () => {
  test.beforeEach(async () => {
    await setScenario('happy')
  })
  test.afterEach(async () => {
    await setScenario('happy')
  })

  test('muestra grupo de fases persistido en detalle del torneo', async ({ page }) => {
    await setScenario('torneo_con_grupos')
    await login(page)
    await page.goto('/torneos/detalle/1')

    await expect(page.getByText('Grupo A')).toBeVisible()
    await expect(page.getByText('Fase en grupo')).toBeVisible()
    await expect(page.getByText('Primera Fase')).toBeVisible()
  })

  test('permite agregar grupo de fases desde la botonera', async ({ page }) => {
    await setScenario('torneo_editable')
    await login(page)
    await page.goto('/torneos/detalle/1')

    await page.getByRole('button', { name: 'Agregar grupo de fases' }).click()
    await expect(page.getByText('Grupo de fases creado')).toBeVisible({ timeout: 5000 })
  })
})

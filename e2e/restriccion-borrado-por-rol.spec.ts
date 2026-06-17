import { expect, test } from '@playwright/test'
import { login, loginAsConsulta, setScenario } from './helpers'

test.describe('Restricción de borrado por rol', () => {
  test.beforeEach(async () => {
    await setScenario('happy')
  })

  test('usuario Consulta no ve el botón eliminar en detalle de torneo', async ({
    page
  }) => {
    await loginAsConsulta(page)
    await page.goto('/torneos/detalle/1')

    await expect(page.getByText('Torneo Apertura 2026')).toBeVisible()
    await expect(page.locator('button[aria-label="Eliminar"]')).toHaveCount(0)
  })

  test('usuario Consulta no ve el botón eliminar en detalle de jugador', async ({
    page
  }) => {
    await setScenario('jugadores_con_datos')
    await loginAsConsulta(page)
    await page.goto('/jugadores/detalle/1')

    await expect(page.getByText('Juan', { exact: true })).toBeVisible()
    await expect(page.locator('button[aria-label="Eliminar"]')).toHaveCount(0)
  })

  test('usuario Consulta no ve el botón eliminar en fase editable', async ({
    page
  }) => {
    await setScenario('torneo_editable')
    await loginAsConsulta(page)
    await page.goto('/torneos/detalle/1')

    await expect(page.getByText('Primera Fase')).toBeVisible()
    await expect(page.locator('button[aria-label="Eliminar fase"]')).toHaveCount(
      0
    )
  })

  test('usuario Administrador sí ve el botón eliminar en detalle de torneo', async ({
    page
  }) => {
    await login(page)
    await page.goto('/torneos/detalle/1')

    await expect(page.locator('button[aria-label="Eliminar"]')).toHaveCount(1)
  })
})

import { expect, test } from '@playwright/test'
import { login, loginAsUsuarioSoloTorneos, setScenario } from './helpers'

test.describe('Restricción de borrado por permisos', () => {
  test.beforeEach(async () => {
    await setScenario('happy')
  })

  test('usuario con edición en Torneos no ve el botón eliminar en detalle de torneo', async ({
    page
  }) => {
    await loginAsUsuarioSoloTorneos(page)
    await page.goto('/torneos/detalle/1')

    await expect(page.getByText('Torneo Apertura 2026').first()).toBeVisible()
    await expect(page.locator('button[aria-label="Eliminar"]')).toHaveCount(0)
  })

  test('usuario con edición en Torneos no ve el botón eliminar en detalle de jugador', async ({
    page
  }) => {
    await setScenario('jugadores_con_datos')
    await loginAsUsuarioSoloTorneos(page)
    await page.goto('/jugadores/detalle/1')

    await expect(page.getByRole('heading', { name: 'Juan González' })).toBeVisible()
    await expect(page.locator('button[aria-label="Eliminar"]')).toHaveCount(0)
  })

  test('usuario con edición en Torneos no ve el botón eliminar en fase editable', async ({
    page
  }) => {
    await setScenario('torneo_editable')
    await loginAsUsuarioSoloTorneos(page)
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

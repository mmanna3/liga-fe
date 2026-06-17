import { expect, test } from '@playwright/test'
import {
  login,
  loginAsSuperAdmin,
  loginAsUsuarioSinPermisos,
  loginAsUsuarioSoloTorneos,
  loginAsUsuarioSoloTorneosControlTotal,
  setScenario
} from './helpers'

test.describe('Permisos en menú lateral', () => {
  test.beforeEach(async () => {
    await setScenario('happy')
  })

  test('administrador con todos los permisos ve módulos principales', async ({
    page
  }) => {
    await login(page)

    await expect(page.getByTestId('nav-torneos')).toBeVisible()
    await expect(page.getByTestId('nav-clubes')).toBeVisible()
    await expect(page.getByTestId('nav-reportes')).toBeVisible()
    await expect(page.getByTestId('nav-configuración')).toBeVisible()
  })

  test('usuario sin permisos no ve módulos de negocio', async ({ page }) => {
    await loginAsUsuarioSinPermisos(page)

    await expect(page.getByTestId('nav-torneos')).toHaveCount(0)
    await expect(page.getByTestId('nav-clubes')).toHaveCount(0)
    await expect(page.getByTestId('nav-reportes')).toHaveCount(0)
    await expect(page.getByTestId('menu-nav')).toBeVisible()
  })

  test('usuario solo con Torneos ve Torneos y no Clubes', async ({ page }) => {
    await loginAsUsuarioSoloTorneos(page)

    await expect(page.getByTestId('nav-torneos')).toBeVisible()
    await expect(page.getByTestId('nav-clubes')).toHaveCount(0)
    await expect(page.getByTestId('nav-configuración')).toHaveCount(0)
  })

  test('usuario solo Torneos edición no ve eliminar en detalle de torneo', async ({
    page
  }) => {
    await setScenario('torneos_con_datos')
    await loginAsUsuarioSoloTorneos(page)
    await page.goto('/torneos/detalle/1')

    await expect(page.getByText('Torneo Apertura 2026').first()).toBeVisible()
    await expect(page.locator('button[aria-label="Eliminar"]')).toHaveCount(0)
  })

  test('usuario Torneos control total sí ve eliminar en detalle de torneo', async ({
    page
  }) => {
    await setScenario('torneos_con_datos')
    await loginAsUsuarioSoloTorneosControlTotal(page)
    await page.goto('/torneos/detalle/1')

    await expect(page.locator('button[aria-label="Eliminar"]')).toHaveCount(1)
  })

  test('super administrador ve ítem SuperAdmin', async ({ page }) => {
    await loginAsSuperAdmin(page)

    await expect(page.getByTestId('nav-superadmin')).toBeVisible()
    await expect(page.getByTestId('nav-torneos')).toBeVisible()
  })
})

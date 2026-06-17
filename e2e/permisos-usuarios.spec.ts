import { expect, test } from '@playwright/test'
import { login, setScenario } from './helpers'

test.describe('Permisos en ABM de usuarios', () => {
  test.beforeEach(async () => {
    await setScenario('happy')
  })

  test('formulario crear usuario muestra matriz de permisos', async ({
    page
  }) => {
    await login(page)
    await page.goto('/configuracion/usuarios/crear')

    await expect(page.getByTestId('matriz-permisos-modulo')).toBeVisible()
    await expect(page.getByTestId('fila-modulo-torneos')).toBeVisible()
    await expect(page.getByTestId('permiso-torneos-edicion')).toBeVisible()
    await expect(page.getByTestId('permiso-torneos-control-total')).toBeVisible()
  })

  test('editar usuario precarga permisos desde API', async ({ page }) => {
    await login(page)
    await page.goto('/configuracion/usuarios/editar/1')

    await expect(page.getByTestId('permiso-torneos-edicion')).toBeChecked()
    await expect(page.getByTestId('permiso-torneos-control-total')).not.toBeChecked()
    await expect(page.getByTestId('permiso-clubes-sin-acceso')).toBeChecked()
  })
})

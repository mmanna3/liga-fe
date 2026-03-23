import { expect, test } from '@playwright/test'
import { login, setScenario } from './helpers'

test.describe('Aprobación y rechazo de delegados', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeEach(async () => {
    await setScenario('happy')
  })
  test.afterEach(async () => {
    await setScenario('happy')
  })

  test('muestra los datos del delegado pendiente de aprobación', async ({ page }) => {
    await setScenario('delegado_pendiente')
    await login(page)
    await page.goto('/delegados/aprobar-rechazar/1/10')

    await expect(page.getByText('Carlos', { exact: true })).toBeVisible()
    await expect(page.getByText('Martínez', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Aprobar' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Rechazar' })).toBeVisible()
  })

  test('aprueba un delegado y regresa a la lista', async ({ page }) => {
    await setScenario('delegado_pendiente')
    await login(page)
    // Navegar a delegados primero para tener historial y que el redirect sea correcto
    await page.goto('/delegados')
    await page.goto('/delegados/aprobar-rechazar/1/10')

    // Esperar que los datos carguen y el botón se habilite
    await expect(page.getByText('Carlos', { exact: true })).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Aprobar' })
    ).not.toBeDisabled()

    await page.getByRole('button', { name: 'Aprobar' }).click()

    await page.waitForURL('/delegados')
    await expect(page).toHaveURL('/delegados')
  })

  test('abre el diálogo de confirmación al rechazar un delegado', async ({ page }) => {
    await setScenario('delegado_pendiente')
    await login(page)
    await page.goto('/delegados/aprobar-rechazar/1/10')

    await expect(page.getByText('Carlos', { exact: true })).toBeVisible()

    // El botón "Rechazar" dispara un diálogo de confirmación
    await page.getByRole('button', { name: 'Rechazar' }).click()

    await expect(
      page.getByText('¿Estás seguro de borrar definitivamente del sistema este delegado?')
    ).toBeVisible()
    await expect(page.getByRole('button', { name: 'Eliminar definitivamente' })).toBeVisible()
  })

  test('confirma el rechazo de un delegado y regresa a la lista', async ({ page }) => {
    await setScenario('delegado_pendiente')
    await login(page)
    await page.goto('/delegados')
    await page.goto('/delegados/aprobar-rechazar/1/10')

    await expect(page.getByText('Carlos', { exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'Rechazar' }).click()
    await expect(
      page.getByRole('button', { name: 'Eliminar definitivamente' })
    ).toBeVisible()
    await page.getByRole('button', { name: 'Eliminar definitivamente' }).click()

    await page.waitForURL('/delegados')
    await expect(page).toHaveURL('/delegados')
  })
})

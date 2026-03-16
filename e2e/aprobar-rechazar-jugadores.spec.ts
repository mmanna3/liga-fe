import { expect, test } from '@playwright/test'
import { login, setScenario } from './helpers'

test.describe('Aprobación y rechazo de jugadores', () => {
  test.describe.configure({ mode: 'serial' })

  test.afterEach(async () => {
    await setScenario('happy')
  })

  test('muestra los datos del jugador pendiente de aprobación', async ({ page }) => {
    await setScenario('jugador_pendiente')
    await login(page)
    await page.goto('/jugadores/aprobar-rechazar/10/1')

    await expect(page.getByText('Juan')).toBeVisible()
    await expect(page.getByText('González')).toBeVisible()
    await expect(page.getByText('12345678')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Aprobar' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Rechazar' })).toBeVisible()
    await expect(
      page.getByPlaceholder('Escribe el motivo del rechazo...')
    ).toBeVisible()
  })

  test('aprueba un jugador y regresa a la lista', async ({ page }) => {
    await setScenario('jugador_pendiente')
    await login(page)
    // Navegar a jugadores primero para generar historial de navegación
    await page.goto('/jugadores')
    await page.goto('/jugadores/aprobar-rechazar/10/1')

    // Esperar que los datos carguen
    await expect(page.getByText('Juan')).toBeVisible()

    await page.getByRole('button', { name: 'Aprobar' }).click()

    await page.waitForURL('/jugadores')
    await expect(page).toHaveURL('/jugadores')
  })

  test('muestra error al intentar rechazar sin motivo', async ({ page }) => {
    await setScenario('jugador_pendiente')
    await login(page)
    await page.goto('/jugadores/aprobar-rechazar/10/1')

    await expect(page.getByText('Juan')).toBeVisible()

    // Click Rechazar sin ingresar motivo
    await page.getByRole('button', { name: 'Rechazar' }).click()

    await expect(
      page.getByText('Hay que ingresar un motivo de rechazo.')
    ).toBeVisible()
    // El usuario sigue en la misma página
    await expect(page).toHaveURL('/jugadores/aprobar-rechazar/10/1')
  })

  test('rechaza un jugador con motivo y regresa a la lista', async ({ page }) => {
    await setScenario('jugador_pendiente')
    await login(page)
    await page.goto('/jugadores')
    await page.goto('/jugadores/aprobar-rechazar/10/1')

    await expect(page.getByText('Juan')).toBeVisible()

    await page.getByPlaceholder('Escribe el motivo del rechazo...').fill(
      'Documentación incompleta'
    )
    await page.getByRole('button', { name: 'Rechazar' }).click()

    await page.waitForURL('/jugadores')
    await expect(page).toHaveURL('/jugadores')
  })
})

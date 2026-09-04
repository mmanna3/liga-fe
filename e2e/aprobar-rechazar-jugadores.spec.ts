import { expect, test } from '@playwright/test'
import { login, setScenario } from './helpers'

test.describe('Aprobación y rechazo de jugadores', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeEach(async () => {
    await setScenario('happy')
  })
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

  test('aprueba un jugador y navega al detalle', async ({ page }) => {
    await setScenario('jugador_pendiente')
    await login(page)
    await page.goto('/jugadores')
    await page.goto('/jugadores/aprobar-rechazar/10/1')

    await expect(page.getByText('Juan')).toBeVisible()

    await page.getByRole('button', { name: 'Aprobar' }).click()

    await page.waitForURL('/jugadores/detalle/1')
    await expect(page).toHaveURL('/jugadores/detalle/1')
  })

  test('aprobar: el detalle muestra el nuevo estado sin recargar la página', async ({
    page
  }) => {
    await setScenario('jugador_pendiente')
    await login(page)

    // El mock por escenario es estático; acá simulamos el cambio de estado real
    // que hace el back al aprobar, para poder distinguir "cache vieja" de "dato fresco".
    let aprobado = false
    const jugadorConEstado = (estado: number) => ({
      id: 1,
      nombre: 'Juan',
      apellido: 'González',
      dni: '12345678',
      fechaNacimiento: '2010-05-15T00:00:00',
      delegadoId: null,
      fotoDNIFrente: null,
      fotoDNIDorso: null,
      fotoCarnet: null,
      equipos: [
        {
          id: 10,
          nombre: 'Infantil A',
          torneo: 'Torneo Apertura 2026',
          estado,
          club: 'Club Defensores del Norte',
          motivo: null,
          tarjetasAmarillas: 0,
          tarjetasRojas: 0
        }
      ]
    })
    await page.route('**/api/Jugador/1', async (route) => {
      if (route.request().method() !== 'GET') {
        await route.continue()
        return
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        // 1 = FichajePendienteDeAprobacion, 6 = AprobadoPendienteDePago
        body: JSON.stringify(jugadorConEstado(aprobado ? 6 : 1))
      })
    })
    await page.route('**/api/Jugador/aprobar-jugador', async (route) => {
      aprobado = true
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '1'
      })
    })

    await page.goto('/jugadores/aprobar-rechazar/10/1')
    await expect(page.getByText('Juan')).toBeVisible()

    await page.getByRole('button', { name: 'Aprobar' }).click()
    await page.waitForURL('/jugadores/detalle/1')

    await expect(
      page.getByText('Aprobado pendiente de pago')
    ).toBeVisible()
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

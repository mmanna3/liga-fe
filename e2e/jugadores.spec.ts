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

  test('desvincular: la lista ya no muestra al jugador sin recargar la página', async ({
    page
  }) => {
    await setScenario('jugadores_con_datos')
    await login(page)

    let desvinculado = false
    await page.route('**/api/Jugador/listado*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(desvinculado ? [] : [
          {
            id: 1,
            dni: '12345678',
            nombre: 'Juan',
            apellido: 'González',
            delegadoId: null,
            jugadorEquipoId: 10,
            equipoId: 10,
            equipoNombre: 'Infantil A',
            club: 'Club Defensores del Norte',
            torneo: 'Torneo Apertura 2026',
            estado: 3
          }
        ])
      })
    })
    await page.route('**/api/Jugador/desvincular-jugador-del-equipo', async (route) => {
      desvinculado = true
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '1'
      })
    })

    // Un solo goto: todo lo que sigue es navegación SPA, para que la cache
    // de la lista poblada acá se reutilice (o no) al volver a /jugadores.
    await page.goto('/jugadores')
    await expect(page.getByText('Registros: 1')).toBeVisible()

    await page.getByText('González').click()
    await page.waitForURL(/\/jugadores\/detalle\/1/)

    await page.getByRole('button', { name: 'Gestionar' }).click()
    await page.waitForURL(/\/jugadores\/cambiar-estado\/10\/1/)

    await page
      .getByRole('button', { name: 'Desvincular jugador del equipo' })
      .click()
    await page.waitForURL(/\/jugadores\/desvincular-del-equipo\/1\//)

    await page
      .getByRole('button', { name: 'Desvincular jugador del equipo' })
      .click()

    await page.waitForURL('/jugadores')
    await expect(page.getByText('No se encontraron resultados.')).toBeVisible()
    await expect(page.getByText('Registros: 0')).toBeVisible()
  })
})

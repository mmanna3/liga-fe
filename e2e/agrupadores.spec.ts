import { expect, test } from '@playwright/test'
import { login, setScenario } from './helpers'

test.describe('Agrupadores de torneo', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeEach(async () => {
    await setScenario('happy')
  })
  test.afterEach(async () => {
    await setScenario('happy')
  })

  // -------------------------------------------------------------------------
  // Lista de agrupadores
  // -------------------------------------------------------------------------

  test('muestra lista de agrupadores con datos', async ({ page }) => {
    await setScenario('torneo_con_agrupadores')
    await login(page)
    await page.goto('/torneos/agrupadores')

    await expect(page.getByText('Liga Infantil')).toBeVisible()
  })

  test('navega a crear agrupador al hacer clic en el botón', async ({ page }) => {
    await setScenario('torneo_con_agrupadores')
    await login(page)
    await page.goto('/torneos/agrupadores')

    await page.getByRole('button', { name: 'Crear agrupador' }).click()

    await page.waitForURL('/torneos/agrupadores/crear')
    await expect(page).toHaveURL('/torneos/agrupadores/crear')
  })

  // -------------------------------------------------------------------------
  // Crear agrupador
  // -------------------------------------------------------------------------

  test('crear agrupador: envía el body correcto y navega a la lista', async ({
    page
  }) => {
    await setScenario('happy')
    await login(page)
    await page.goto('/torneos/agrupadores/crear')

    let bodyEnviado: unknown = null
    await page.route('**/api/TorneoAgrupador', async (route) => {
      if (route.request().method() === 'POST') {
        bodyEnviado = JSON.parse(route.request().postData() ?? '{}')
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id: 99, nombre: 'Copa Regional', visibleEnApp: true })
        })
      } else {
        await route.continue()
      }
    })

    await page.getByPlaceholder('Nombre del agrupador').fill('Copa Regional')
    await page.getByRole('button', { name: 'Guardar' }).click()

    await page.waitForURL('/torneos/agrupadores')
    expect(bodyEnviado).toBeTruthy()
    const body = bodyEnviado as { nombre: string; visibleEnApp: boolean }
    expect(body.nombre).toBe('Copa Regional')
    expect(body.visibleEnApp).toBe(true)
  })

  test('crear agrupador: el switch de visibilidad funciona', async ({ page }) => {
    await setScenario('happy')
    await login(page)
    await page.goto('/torneos/agrupadores/crear')

    let bodyEnviado: unknown = null
    await page.route('**/api/TorneoAgrupador', async (route) => {
      if (route.request().method() === 'POST') {
        bodyEnviado = JSON.parse(route.request().postData() ?? '{}')
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id: 99, nombre: 'Copa Oculta', visibleEnApp: false })
        })
      } else {
        await route.continue()
      }
    })

    await page.getByPlaceholder('Nombre del agrupador').fill('Copa Oculta')
    // El switch "Es visible en la app" empieza en true → lo desactivamos
    await page.getByRole('switch', { name: 'Es visible en la app' }).click()
    await page.getByRole('button', { name: 'Guardar' }).click()

    await page.waitForURL('/torneos/agrupadores')
    const body = bodyEnviado as { visibleEnApp: boolean }
    expect(body.visibleEnApp).toBe(false)
  })

  // -------------------------------------------------------------------------
  // Editar agrupador
  // -------------------------------------------------------------------------

  test('editar agrupador: muestra el nombre actual en el formulario', async ({
    page
  }) => {
    await setScenario('torneo_con_agrupadores')
    await login(page)
    await page.goto('/torneos/agrupadores/editar/1')

    await expect(page.getByLabel('Nombre')).toHaveValue('Liga Infantil')
  })

  test('editar agrupador: muestra los torneos asociados', async ({ page }) => {
    await setScenario('torneo_con_agrupadores')
    await login(page)
    await page.goto('/torneos/agrupadores/editar/1')

    await expect(page.getByText('Torneo Apertura 2026')).toBeVisible()
  })

  test('editar agrupador: guardar envía PUT con nombre actualizado', async ({
    page
  }) => {
    await setScenario('torneo_con_agrupadores')
    await login(page)
    await page.goto('/torneos/agrupadores/editar/1')

    let bodyEnviado: unknown = null
    await page.route('**/api/TorneoAgrupador/1', async (route) => {
      if (route.request().method() === 'PUT') {
        bodyEnviado = JSON.parse(route.request().postData() ?? '{}')
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(null)
        })
      } else {
        await route.continue()
      }
    })

    const inputNombre = page.getByLabel('Nombre')
    await inputNombre.fill('Liga Infantil Modificada')
    await page.getByRole('button', { name: 'Guardar' }).click()

    await expect(page.getByText('Agrupador actualizado correctamente')).toBeVisible()
    const body = bodyEnviado as { nombre: string }
    expect(body.nombre).toBe('Liga Infantil Modificada')
  })

  test('editar agrupador: el botón Guardar está deshabilitado sin cambios', async ({
    page
  }) => {
    await setScenario('torneo_con_agrupadores')
    await login(page)
    await page.goto('/torneos/agrupadores/editar/1')

    // Sin modificar nada, Guardar debe estar deshabilitado
    await expect(page.getByRole('button', { name: 'Guardar' })).toBeDisabled()
  })
})

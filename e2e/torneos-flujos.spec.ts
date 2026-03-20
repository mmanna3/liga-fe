import { expect, test } from '@playwright/test'
import { login, setScenario } from './helpers'

test.describe('Torneos — flujos profundos', () => {
  test.describe.configure({ mode: 'serial' })

  test.afterEach(async () => {
    await setScenario('happy')
  })

  // -------------------------------------------------------------------------
  // Crear torneo
  // -------------------------------------------------------------------------

  test('muestra el selector de agrupador al entrar a crear torneo', async ({ page }) => {
    await setScenario('torneo_con_agrupadores')
    await login(page)
    await page.goto('/torneos/crear')

    await expect(page.getByText('Crear nuevo torneo')).toBeVisible()
    await expect(page.getByText('Liga Infantil')).toBeVisible()
  })

  test('crea un torneo completo y navega a la lista', async ({ page }) => {
    await setScenario('torneo_con_agrupadores')
    await login(page)
    await page.goto('/torneos/crear')

    // Nombre
    await page.getByPlaceholder('Ej: Torneo Anual 2026').fill('Torneo E2E 2026')

    // Agrupador (SelectorSimple → botón con el nombre)
    await page.getByRole('button', { name: 'Liga Infantil' }).click()

    // Agregar categoría
    await page.getByRole('button', { name: 'Agregar' }).click()
    await page.getByPlaceholder('Ej: +40, Sub 15, Mayores').fill('Sub 12')
    await page.getByPlaceholder('Desde').fill('2014')
    await page.getByPlaceholder('Hasta').fill('2015')
    await page.getByRole('button', { name: 'Guardar' }).click()

    // Verificar que la categoría se agregó
    await expect(page.getByText('Sub 12')).toBeVisible()

    // Seleccionar formato de fase
    await page.getByRole('button', { name: 'Todos contra todos' }).click()

    // Enviar
    await page.getByRole('button', { name: 'Crear torneo' }).click()

    await page.waitForURL('/torneos')
    await expect(page).toHaveURL('/torneos')
  })

  // -------------------------------------------------------------------------
  // Detalle del torneo
  // -------------------------------------------------------------------------

  test('muestra el detalle del torneo con sus fases y categorías', async ({ page }) => {
    await setScenario('torneo_detalle')
    await login(page)
    await page.goto('/torneos/detalle/1')

    await expect(page.getByText('Torneo Apertura 2026').first()).toBeVisible()
    await expect(page.getByText('Primera Fase')).toBeVisible()
    await expect(page.getByText('Todos contra todos')).toBeVisible()
    await expect(page.getByText('Sub 12')).toBeVisible()
  })

  test('agrega una fase nueva desde el detalle del torneo', async ({ page }) => {
    await setScenario('torneo_editable')
    await login(page)
    await page.goto('/torneos/detalle/1')

    await expect(page.getByText('Primera Fase')).toBeVisible()

    // Cambiamos el escenario para que el POST y el refetch GET devuelvan la fase nueva
    await setScenario('torneo_editable_con_nueva_fase')
    await page.getByRole('button', { name: 'Agregar fase' }).click()

    await expect(page.getByText('Nueva fase')).toBeVisible()
  })

  test('el botón Guardar aparece al entrar en modo edición', async ({ page }) => {
    await setScenario('torneo_editable')
    await login(page)
    await page.goto('/torneos/detalle/1')

    // Por defecto no hay botón Guardar
    await expect(page.getByRole('button', { name: 'Guardar' })).not.toBeVisible()

    // Al hacer clic en el lápiz, aparece Guardar
    await page.getByRole('button', { name: 'Editar torneo' }).click()
    await expect(page.getByRole('button', { name: 'Guardar' })).toBeVisible()
  })

  // -------------------------------------------------------------------------
  // Zonas de una fase — visualización
  // -------------------------------------------------------------------------

  test('navega a las zonas de una fase desde el detalle del torneo', async ({ page }) => {
    await setScenario('torneo_detalle')
    await login(page)
    await page.goto('/torneos/detalle/1')

    await expect(page.getByText('Primera Fase')).toBeVisible()

    await page.getByRole('button', { name: 'Zonas de la fase' }).click()

    await page.waitForURL(/\/torneos\/detalle\/1\/fases\/100\/zonas/)
    await expect(page).toHaveURL('/torneos/detalle/1/fases/100/zonas')
  })

  test('muestra la pantalla de zonas vacía con equipos disponibles', async ({ page }) => {
    await setScenario('torneo_zonas_vacio')
    await login(page)
    await page.goto('/torneos/detalle/1/fases/100/zonas')

    await expect(page.getByText('Zonas')).toBeVisible()
    await expect(page.getByText('Infantil A')).toBeVisible()
    await expect(page.getByText('Infantil B')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Agregar Zona' })).toBeVisible()
  })

  test('agrega una zona en la pantalla de zonas', async ({ page }) => {
    await setScenario('torneo_zonas_vacio')
    await login(page)
    await page.goto('/torneos/detalle/1/fases/100/zonas')

    await page.getByRole('button', { name: 'Agregar Zona' }).click()

    // Debe aparecer una zona nueva
    // El botón Guardar aparece (gestor-zonas lo muestra)
    await expect(page.getByRole('button', { name: 'Guardar' })).toBeVisible()
  })

  test('muestra zonas existentes con equipos asignados', async ({ page }) => {
    await setScenario('torneo_zonas_con_datos')
    await login(page)
    await page.goto('/torneos/detalle/1/fases/100/zonas')

    await expect(page.getByText('Zona A')).toBeVisible()
    await expect(page.getByText('Infantil A')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Guardar' })).toBeVisible()
  })

  // -------------------------------------------------------------------------
  // Guardar zonas — verificar body enviado al backend
  // -------------------------------------------------------------------------

  test('crear zonas: envía zonas nuevas con equipos correctos', async ({ page }) => {
    await setScenario('torneo_zonas_vacio')
    await login(page)
    await page.goto('/torneos/detalle/1/fases/100/zonas')

    let bodyEnviado: unknown = null
    await page.route(
      '**/api/TorneoFase/*/zonas/crear-zonas-masivamente',
      async (route) => {
        if (route.request().method() === 'POST') {
          bodyEnviado = JSON.parse(route.request().postData() ?? '[]')
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{ id: 1, nombre: 'Zona A', equipos: [] }])
        })
      }
    )

    // En modo crear, ya existe Zona A por defecto. Arrastrar Infantil A a ella.
    const zonaCard = page.getByTestId('zona-card').first()
    await page.getByText('Infantil A').first().dragTo(zonaCard)

    await page.getByRole('button', { name: 'Guardar' }).click()
    await expect(page.getByText('Zonas creadas correctamente')).toBeVisible()

    expect(bodyEnviado).toBeTruthy()
    const body = bodyEnviado as Array<{ nombre: string; equipos: Array<{ id: string }> }>
    expect(body).toHaveLength(1)
    expect(body[0].nombre).toBe('Zona A')
    expect(body[0].equipos).toHaveLength(1)
    expect(body[0].equipos[0].id).toBe('1')
  })

  test('modificar zonas: agregar equipo a zona existente envía TODOS los equipos', async ({
    page
  }) => {
    await setScenario('torneo_zonas_con_datos')
    await login(page)
    await page.goto('/torneos/detalle/1/fases/100/zonas')

    await expect(page.getByText('Zona A')).toBeVisible()
    const zonaCard = page.getByTestId('zona-card').first()
    await expect(zonaCard.getByText('Infantil A')).toBeVisible()

    let bodyEnviado: unknown = null
    await page.route(
      '**/api/TorneoFase/*/zonas/modificar-zonas-masivamente',
      async (route) => {
        if (route.request().method() === 'PUT') {
          bodyEnviado = JSON.parse(route.request().postData() ?? '[]')
        }
        await route.fulfill({ status: 200 })
      }
    )

    // Arrastrar Infantil B (del buscador) a Zona A
    await page.getByText('Infantil B').first().dragTo(zonaCard)

    // Verificar que la UI muestra ambos equipos
    await expect(zonaCard.getByText('Infantil A')).toBeVisible()
    await expect(zonaCard.getByText('Infantil B')).toBeVisible()

    await page.getByRole('button', { name: 'Guardar' }).click()
    await expect(page.getByText('Zonas actualizadas correctamente')).toBeVisible()

    expect(bodyEnviado).toBeTruthy()
    const body = bodyEnviado as Array<{ nombre: string; equipos: Array<{ id: string }> }>
    expect(body).toHaveLength(1)
    expect(body[0].nombre).toBe('Zona A')
    expect(body[0].equipos).toHaveLength(2)
    const ids = body[0].equipos.map((e) => e.id).sort()
    expect(ids).toEqual(['1', '2'])
  })

  test('modificar zonas: cambiar nombre envía nombre actualizado', async ({ page }) => {
    await setScenario('torneo_zonas_con_datos')
    await login(page)
    await page.goto('/torneos/detalle/1/fases/100/zonas')

    await expect(page.getByText('Zona A')).toBeVisible()

    let bodyEnviado: unknown = null
    await page.route(
      '**/api/TorneoFase/*/zonas/modificar-zonas-masivamente',
      async (route) => {
        if (route.request().method() === 'PUT') {
          bodyEnviado = JSON.parse(route.request().postData() ?? '[]')
        }
        await route.fulfill({ status: 200 })
      }
    )

    // Clic en el nombre → editar → blur
    await page.getByText('Zona A').first().click()
    const inputNombre = page.getByPlaceholder('Nombre de la zona')
    await inputNombre.fill('Zona Norte')
    await inputNombre.blur()

    await page.getByRole('button', { name: 'Guardar' }).click()
    await expect(page.getByText('Zonas actualizadas correctamente')).toBeVisible()

    expect(bodyEnviado).toBeTruthy()
    const body = bodyEnviado as Array<{ nombre: string }>
    expect(body).toHaveLength(1)
    expect(body[0].nombre).toBe('Zona Norte')
  })

  test('modificar zonas: eliminar zona y crear nueva envía solo la nueva', async ({
    page
  }) => {
    await setScenario('torneo_zonas_con_datos')
    await login(page)
    await page.goto('/torneos/detalle/1/fases/100/zonas')

    let bodyEnviado: unknown = null
    await page.route(
      '**/api/TorneoFase/*/zonas/modificar-zonas-masivamente',
      async (route) => {
        if (route.request().method() === 'PUT') {
          bodyEnviado = JSON.parse(route.request().postData() ?? '[]')
        }
        await route.fulfill({ status: 200 })
      }
    )

    // Eliminar la zona existente
    await page.getByRole('button', { name: 'Eliminar zona' }).click()

    // Agregar zona nueva
    await page.getByRole('button', { name: 'Agregar Zona' }).click()

    // Arrastrar Infantil B a la nueva zona
    const zonaCard = page.getByTestId('zona-card').first()
    await page.getByText('Infantil B').first().dragTo(zonaCard)

    await page.getByRole('button', { name: 'Guardar' }).click()
    await expect(page.getByText('Zonas actualizadas correctamente')).toBeVisible()

    expect(bodyEnviado).toBeTruthy()
    const body = bodyEnviado as Array<{
      nombre: string
      id?: number
      equipos: Array<{ id: string }>
    }>
    expect(body).toHaveLength(1)
    expect(body[0].nombre).toBe('Nueva Zona')
    expect(body[0].id).toBeUndefined()
    expect(body[0].equipos).toHaveLength(1)
    expect(body[0].equipos[0].id).toBe('2')
  })

  test('modificar zonas: quitar equipo de zona envía zona sin ese equipo', async ({
    page
  }) => {
    await setScenario('torneo_zonas_con_datos')
    await login(page)
    await page.goto('/torneos/detalle/1/fases/100/zonas')

    // Primero agregar Infantil B para tener 2 equipos
    const zonaCard = page.getByTestId('zona-card').first()
    await page.getByText('Infantil B').first().dragTo(zonaCard)
    await expect(zonaCard.getByText('Infantil B')).toBeVisible()

    let bodyEnviado: unknown = null
    await page.route(
      '**/api/TorneoFase/*/zonas/modificar-zonas-masivamente',
      async (route) => {
        if (route.request().method() === 'PUT') {
          bodyEnviado = JSON.parse(route.request().postData() ?? '[]')
        }
        await route.fulfill({ status: 200 })
      }
    )

    // Quitar Infantil A: buscar el row del equipo y clickear su botón X
    const rowInfantilA = zonaCard
      .locator('.flex.items-center.justify-between')
      .filter({ hasText: 'Infantil A' })
      .filter({ hasNotText: 'Infantil B' })
    await rowInfantilA.getByRole('button', { name: 'Quitar equipo' }).click()

    await page.getByRole('button', { name: 'Guardar' }).click()
    await expect(page.getByText('Zonas actualizadas correctamente')).toBeVisible()

    expect(bodyEnviado).toBeTruthy()
    const body = bodyEnviado as Array<{ equipos: Array<{ id: string }> }>
    expect(body).toHaveLength(1)
    expect(body[0].equipos).toHaveLength(1)
    expect(body[0].equipos[0].id).toBe('2')
  })

  test('crear zonas: dos zonas con equipos distintos envía ambas', async ({ page }) => {
    await setScenario('torneo_zonas_vacio')
    await login(page)
    await page.goto('/torneos/detalle/1/fases/100/zonas')

    let bodyEnviado: unknown = null
    await page.route(
      '**/api/TorneoFase/*/zonas/crear-zonas-masivamente',
      async (route) => {
        if (route.request().method() === 'POST') {
          bodyEnviado = JSON.parse(route.request().postData() ?? '[]')
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        })
      }
    )

    // Zona A ya existe por defecto. Agregar otra zona.
    await page.getByRole('button', { name: 'Agregar Zona' }).click()

    const zonas = page.getByTestId('zona-card')
    const zona1 = zonas.nth(0)
    const zona2 = zonas.nth(1)

    // Arrastrar Infantil A a la primera zona
    await page.getByText('Infantil A').first().dragTo(zona1)
    // Arrastrar Infantil B a la segunda zona
    await page.getByText('Infantil B').first().dragTo(zona2)

    await page.getByRole('button', { name: 'Guardar' }).click()
    await expect(page.getByText('Zonas creadas correctamente')).toBeVisible()

    expect(bodyEnviado).toBeTruthy()
    const body = bodyEnviado as Array<{ nombre: string; equipos: Array<{ id: string }> }>
    expect(body).toHaveLength(2)

    const zonaA = body.find((z) => z.nombre === 'Zona A')
    const zonaNueva = body.find((z) => z.nombre === 'Nueva Zona')
    expect(zonaA).toBeTruthy()
    expect(zonaNueva).toBeTruthy()
    expect(zonaA!.equipos).toHaveLength(1)
    expect(zonaNueva!.equipos).toHaveLength(1)
    expect(zonaA!.equipos[0].id).toBe('1')
    expect(zonaNueva!.equipos[0].id).toBe('2')
  })
})

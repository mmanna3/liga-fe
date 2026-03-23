import { expect, test } from '@playwright/test'
import { login, setScenario } from './helpers'

test.describe('Torneos — flujos profundos', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeEach(async () => {
    await setScenario('happy')
  })
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

  // -------------------------------------------------------------------------
  // Edición de categorías
  // -------------------------------------------------------------------------

  test('agregar categoría en modo edición: la nueva categoría aparece como badge', async ({
    page
  }) => {
    await setScenario('torneo_editable')
    await login(page)
    await page.goto('/torneos/detalle/1')

    await page.getByRole('button', { name: 'Editar torneo' }).click()

    // Abrir el formulario de nueva categoría
    await page.getByRole('button', { name: 'Agregar' }).click()

    // Llenar el formulario
    await page.getByPlaceholder('Ej: +40, Sub 15, Mayores').fill('Sub 15')
    await page.getByPlaceholder('Desde').fill('2011')
    await page.getByPlaceholder('Hasta').fill('2012')

    // Guardar la categoría (primer Guardar — el del formulario de categoría)
    await page.getByRole('button', { name: 'Guardar' }).first().click()

    // El badge de la nueva categoría debe aparecer
    await expect(page.getByText('Sub 15')).toBeVisible()
  })

  test('agregar categoría y guardar torneo: el body incluye la nueva categoría', async ({
    page
  }) => {
    await setScenario('torneo_editable')
    await login(page)
    await page.goto('/torneos/detalle/1')

    await page.getByRole('button', { name: 'Editar torneo' }).click()

    await page.getByRole('button', { name: 'Agregar' }).click()
    await page.getByPlaceholder('Ej: +40, Sub 15, Mayores').fill('Sub 15')
    await page.getByPlaceholder('Desde').fill('2011')
    await page.getByPlaceholder('Hasta').fill('2012')
    await page.getByRole('button', { name: 'Guardar' }).first().click()

    let bodyEnviado: unknown = null
    await page.route('**/api/Torneo/1', async (route) => {
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

    // Guardar el torneo (único Guardar restante en la página)
    await page.getByRole('button', { name: 'Guardar' }).click()

    await expect(page.getByText('Torneo actualizado correctamente')).toBeVisible()
    const body = bodyEnviado as { categorias: Array<{ nombre: string }> }
    expect(body.categorias).toHaveLength(2)
    const nombres = body.categorias.map((c) => c.nombre)
    expect(nombres).toContain('Sub 12')
    expect(nombres).toContain('Sub 15')
  })

  test('quitar categoría y guardar torneo: el body no incluye la categoría eliminada', async ({
    page
  }) => {
    await setScenario('torneo_editable')
    await login(page)
    await page.goto('/torneos/detalle/1')

    await page.getByRole('button', { name: 'Editar torneo' }).click()

    // "Sub 12" debe estar visible como badge
    await expect(page.getByText('Sub 12')).toBeVisible()

    // Clic en la X del badge "Sub 12"
    // El badge contiene un <button> con el icono X para quitar la categoría
    await page.getByText('Sub 12').locator('button').click()

    await expect(page.getByText('Sub 12')).not.toBeVisible()

    let bodyEnviado: unknown = null
    await page.route('**/api/Torneo/1', async (route) => {
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

    await page.getByRole('button', { name: 'Guardar' }).click()

    await expect(page.getByText('Torneo actualizado correctamente')).toBeVisible()
    const body = bodyEnviado as { categorias: Array<{ nombre: string }> }
    expect(body.categorias).toHaveLength(0)
  })

  // -------------------------------------------------------------------------
  // Eliminar fase
  // -------------------------------------------------------------------------

  test('eliminar fase (editable): modal de confirmación aparece', async ({
    page
  }) => {
    await setScenario('torneo_editable')
    await login(page)
    await page.goto('/torneos/detalle/1')

    // El botón eliminar de la fase está junto al botón "Zonas de la fase"
    const botonesContainer = page
      .getByRole('button', { name: 'Zonas de la fase' })
      .locator('..')
    await botonesContainer.locator('button').last().click()

    await expect(page.getByRole('alertdialog')).toBeVisible()
    await expect(page.getByRole('alertdialog')).toContainText('Eliminar fase')
  })

  test('eliminar fase (editable): confirmar elimina la fase de la UI', async ({
    page
  }) => {
    await setScenario('torneo_editable')
    await login(page)
    await page.goto('/torneos/detalle/1')

    await expect(page.getByText('Primera Fase')).toBeVisible()

    const botonesContainer = page
      .getByRole('button', { name: 'Zonas de la fase' })
      .locator('..')
    await botonesContainer.locator('button').last().click()

    await page.getByRole('alertdialog').getByRole('button', { name: 'Eliminar' }).click()

    await expect(page.getByText('Primera Fase')).not.toBeVisible()
  })

  test('eliminar fase no editable: muestra aviso "No se puede eliminar"', async ({
    page
  }) => {
    await setScenario('torneo_detalle')
    await login(page)
    await page.goto('/torneos/detalle/1')

    // En torneo_detalle la fase tiene sePuedeEditar: false
    const botonesContainer = page
      .getByRole('button', { name: 'Zonas de la fase' })
      .locator('..')
    await botonesContainer.locator('button').last().click()

    await expect(page.getByRole('alertdialog')).toBeVisible()
    await expect(page.getByRole('alertdialog')).toContainText('No se puede eliminar')

    await page.getByRole('alertdialog').getByRole('button', { name: 'Volver' }).click()
    await expect(page.getByRole('alertdialog')).not.toBeVisible()
  })

  // -------------------------------------------------------------------------
  // Edición de datos básicos del torneo
  // -------------------------------------------------------------------------

  test('en modo edición los inputs muestran los valores actuales del torneo', async ({
    page
  }) => {
    await setScenario('torneo_editable')
    await login(page)
    await page.goto('/torneos/detalle/1')

    await page.getByRole('button', { name: 'Editar torneo' }).click()

    await expect(page.getByPlaceholder('Ej: Torneo Anual 2026')).toHaveValue(
      'Torneo Apertura 2026'
    )
    await expect(page.getByPlaceholder('2026', { exact: true })).toHaveValue('2026')
  })

  test('guardar envía torneoPUT con los datos actualizados y sin fases en el body', async ({
    page
  }) => {
    await setScenario('torneo_editable')
    await login(page)
    await page.goto('/torneos/detalle/1')

    await page.getByRole('button', { name: 'Editar torneo' }).click()

    await page
      .getByPlaceholder('Ej: Torneo Anual 2026')
      .fill('Torneo Modificado 2026')

    let bodyEnviado: unknown = null
    await page.route('**/api/Torneo/1', async (route) => {
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

    await page.getByRole('button', { name: 'Guardar' }).click()

    await expect(page.getByText('Torneo actualizado correctamente')).toBeVisible()
    expect(bodyEnviado).toBeTruthy()
    const body = bodyEnviado as Record<string, unknown>
    expect(body.nombre).toBe('Torneo Modificado 2026')
    expect(body.fases).toBeUndefined()
  })

  test('cancelar edición restaura los valores originales y oculta el formulario', async ({
    page
  }) => {
    await setScenario('torneo_editable')
    await login(page)
    await page.goto('/torneos/detalle/1')

    await page.getByRole('button', { name: 'Editar torneo' }).click()

    const inputNombre = page.getByPlaceholder('Ej: Torneo Anual 2026')
    await inputNombre.fill('Nombre Diferente')

    await page.getByRole('button', { name: 'Cancelar' }).click()

    await expect(inputNombre).not.toBeVisible()
    await expect(page.getByText('Torneo Apertura 2026').first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'Guardar' })).not.toBeVisible()
  })

  // -------------------------------------------------------------------------
  // Edición de fases
  // -------------------------------------------------------------------------

  test('cambiar nombre de fase llama a fasesPUT con el nuevo nombre', async ({
    page
  }) => {
    await setScenario('torneo_editable')
    await login(page)
    await page.goto('/torneos/detalle/1')

    let bodyEnviado: unknown = null
    await page.route('**/api/Torneo/*/fases/*', async (route) => {
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

    // Clic en el texto editable "Primera Fase" → aparece el input
    await page.getByText('Primera Fase').first().click()
    const inputFase = page.locator('input').first()
    await inputFase.fill('Primera Fase Modificada')
    await inputFase.blur()

    await expect(page.getByText('Nombre actualizado')).toBeVisible()
    expect(bodyEnviado).toBeTruthy()
    const body = bodyEnviado as { nombre: string }
    expect(body.nombre).toBe('Primera Fase Modificada')
  })

  test('cambiar formato de fase llama a fasesPUT con el nuevo formatoId', async ({
    page
  }) => {
    await setScenario('torneo_editable')
    await login(page)
    await page.goto('/torneos/detalle/1')

    // TORNEO_EDITABLE tiene faseFormatoId: 1 = 'todos-contra-todos'
    await expect(
      page.getByRole('button', { name: 'Todos contra todos' })
    ).toBeVisible()

    let bodyEnviado: unknown = null
    await page.route('**/api/Torneo/*/fases/*', async (route) => {
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

    await page.getByRole('button', { name: 'Eliminación directa' }).click()

    await expect(page.getByText('Formato actualizado')).toBeVisible()
    expect(bodyEnviado).toBeTruthy()
    const body = bodyEnviado as { faseFormatoId: number }
    expect(body.faseFormatoId).toBe(2)
  })

  // -------------------------------------------------------------------------
  // Eliminar torneo
  // -------------------------------------------------------------------------

  test('eliminar torneo: modal de confirmación y llamada a torneoDELETE', async ({
    page
  }) => {
    // happy: TORNEO_1 tiene fases: [] → puedeEliminar = true
    await setScenario('happy')
    await login(page)
    await page.goto('/torneos/detalle/1')

    let deleteLlamado = false
    await page.route('**/api/Torneo/1', async (route) => {
      if (route.request().method() === 'DELETE') {
        deleteLlamado = true
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(1)
        })
      } else {
        await route.continue()
      }
    })

    // Clic en el botón eliminar (aria-label='Eliminar') → abre el modal
    await page.locator('button[aria-label="Eliminar"]').click()

    await expect(page.getByText('Eliminar torneo').first()).toBeVisible()
    await expect(
      page.getByText('¿Estás seguro', { exact: false })
    ).toBeVisible()

    // Confirmar en el modal
    await page.getByRole('button', { name: 'Eliminar torneo' }).click()

    await page.waitForURL('/torneos')
    expect(deleteLlamado).toBe(true)
  })

  // -------------------------------------------------------------------------
  // Zonas — equipo desaparece del buscador al asignarlo
  // -------------------------------------------------------------------------

  test('equipo asignado a zona desaparece del panel de equipos disponibles', async ({
    page
  }) => {
    await setScenario('torneo_zonas_vacio')
    await login(page)
    await page.goto('/torneos/detalle/1/fases/100/zonas')

    // Ambos equipos visibles en el buscador
    await expect(page.getByText('Infantil A').first()).toBeVisible()
    await expect(page.getByText('Infantil B').first()).toBeVisible()

    const zonaCard = page.getByTestId('zona-card').first()
    await page.getByText('Infantil A').first().dragTo(zonaCard)

    // Infantil A ahora está en la zona-card
    await expect(zonaCard.getByText('Infantil A')).toBeVisible()

    // Infantil A aparece solo una vez (en la zona-card, no en el buscador)
    await expect(page.getByText('Infantil A')).toHaveCount(1)
    // Infantil B sigue disponible en el buscador
    await expect(page.getByText('Infantil B')).toBeVisible()
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

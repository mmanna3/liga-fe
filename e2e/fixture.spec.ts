import { expect, test } from '@playwright/test'
import { login, setScenario } from './helpers'

const FIXTURE_URL = '/torneos/detalle/1/fases/100/zonas/1/fixture'

test.describe('Fixture', () => {
  test.describe.configure({ mode: 'serial' })

  test.afterEach(async () => {
    await setScenario('happy')
  })

  // -------------------------------------------------------------------------
  // Vista sin fechas existentes — lista de equipos y configuración
  // -------------------------------------------------------------------------

  test('muestra la lista de equipos cuando la zona no tiene fechas', async ({
    page
  }) => {
    await setScenario('fixture_sin_fechas')
    await login(page)
    await page.goto(FIXTURE_URL)

    await expect(
      page.getByText('Orden de equipos (arrastrá para reordenar)')
    ).toBeVisible()
    await expect(page.getByText('Infantil A')).toBeVisible()
    await expect(page.getByText('Infantil B')).toBeVisible()
  })

  test('el botón "Generar vista previa del fixture" está habilitado cuando el algoritmo tiene fechas', async ({
    page
  }) => {
    await setScenario('fixture_sin_fechas')
    await login(page)
    await page.goto(FIXTURE_URL)

    await expect(
      page.getByRole('button', { name: 'Generar vista previa del fixture' })
    ).toBeEnabled()
  })

  test('el botón "Generar vista previa del fixture" está deshabilitado cuando el algoritmo no tiene fechas configuradas', async ({
    page
  }) => {
    await setScenario('fixture_algoritmo_sin_configurar')
    await login(page)
    await page.goto(FIXTURE_URL)

    await expect(
      page.getByRole('button', { name: 'Generar vista previa del fixture' })
    ).toBeDisabled()
    await expect(
      page.getByText(
        'El fixture para esta cantidad de equipos no está configurado.'
      )
    ).toBeVisible()
  })

  test('resalta el algoritmo que coincide con la cantidad de equipos', async ({
    page
  }) => {
    await setScenario('fixture_sin_fechas')
    await login(page)
    await page.goto(FIXTURE_URL)

    // El algoritmo para 2 equipos debe estar resaltado (bg-primary)
    const badge = page.locator('.bg-primary.text-primary-foreground', {
      hasText: '2'
    })
    await expect(badge).toBeVisible()
  })

  // -------------------------------------------------------------------------
  // Flujo "Generar vista previa del fixture"
  // -------------------------------------------------------------------------

  test('al clic en "Generar vista previa del fixture" desaparece la lista y se muestran las fechas del algoritmo', async ({
    page
  }) => {
    await setScenario('fixture_sin_fechas')
    await login(page)
    await page.goto(FIXTURE_URL)

    await page
      .getByRole('button', { name: 'Generar vista previa del fixture' })
      .click()

    await expect(
      page.getByText('Orden de equipos (arrastrá para reordenar)')
    ).not.toBeVisible()
    await expect(page.getByText('Fecha 1')).toBeVisible()
    await expect(page.getByText('Infantil A')).toBeVisible()
    await expect(page.getByText('Infantil B')).toBeVisible()
  })

  test('luego de generar el fixture muestra el botón "Crear fechas y jornadas"', async ({
    page
  }) => {
    await setScenario('fixture_sin_fechas')
    await login(page)
    await page.goto(FIXTURE_URL)

    await page
      .getByRole('button', { name: 'Generar vista previa del fixture' })
      .click()

    await expect(
      page.getByRole('button', { name: 'Crear fechas y jornadas' })
    ).toBeVisible()
    await expect(
      page.getByText('El fixture generado podrá modificarse luego.')
    ).toBeVisible()
  })

  // -------------------------------------------------------------------------
  // Crear fechas y jornadas — verificar body enviado al backend
  // -------------------------------------------------------------------------

  test('crear fechas y jornadas: envía las fechas y jornadas correctas al backend', async ({
    page
  }) => {
    await setScenario('fixture_sin_fechas')
    await login(page)
    await page.goto(FIXTURE_URL)

    let bodyEnviado: unknown = null
    await page.route(
      '**/api/TorneoZona/*/fechas/crear-fechas-masivamente',
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

    await page
      .getByRole('button', { name: 'Generar vista previa del fixture' })
      .click()
    await page.getByRole('button', { name: 'Crear fechas y jornadas' }).click()
    await expect(
      page.getByText('Fechas y jornadas creadas correctamente')
    ).toBeVisible()

    expect(bodyEnviado).toBeTruthy()
    const body = bodyEnviado as Array<{
      numero: number
      esVisibleEnApp: boolean
      jornadas: Array<{
        tipo: string
        resultadosVerificados: boolean
        localId: number
        visitanteId: number
      }>
    }>
    expect(body).toHaveLength(1)
    expect(body[0].numero).toBe(1)
    expect(body[0].esVisibleEnApp).toBe(false)
    expect(body[0].jornadas).toHaveLength(1)
    expect(body[0].jornadas[0].tipo).toBe('Normal')
    expect(body[0].jornadas[0].resultadosVerificados).toBe(false)
    expect(body[0].jornadas[0].localId).toBe(1)
    expect(body[0].jornadas[0].visitanteId).toBe(2)
  })

  // -------------------------------------------------------------------------
  // Vista con fechas existentes
  // -------------------------------------------------------------------------

  test('si la zona ya tiene fechas las muestra directamente sin la lista de equipos', async ({
    page
  }) => {
    await setScenario('fixture_con_fechas')
    await login(page)
    await page.goto(FIXTURE_URL)

    await expect(
      page.getByText('Orden de equipos (arrastrá para reordenar)')
    ).not.toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Generar vista previa del fixture' })
    ).not.toBeVisible()
    await expect(page.getByText('Fecha 1')).toBeVisible()
  })

  test('la vista de fechas existentes muestra los nombres de los equipos', async ({
    page
  }) => {
    await setScenario('fixture_con_fechas')
    await login(page)
    await page.goto(FIXTURE_URL)

    await expect(page.getByText('Infantil A')).toBeVisible()
    await expect(page.getByText('Infantil B')).toBeVisible()
  })

  // -------------------------------------------------------------------------
  // Agregar fecha
  // -------------------------------------------------------------------------

  test('muestra el botón "Agregar fecha +" cuando hay fechas existentes', async ({
    page
  }) => {
    await setScenario('fixture_con_fechas')
    await login(page)
    await page.goto(FIXTURE_URL)

    await expect(
      page.getByRole('button', { name: 'Agregar fecha +' })
    ).toBeVisible()
  })

  test('al clic en "Agregar fecha +" aparece el formulario de nueva fecha', async ({
    page
  }) => {
    await setScenario('fixture_con_fechas')
    await login(page)
    await page.goto(FIXTURE_URL)

    await page.getByRole('button', { name: 'Agregar fecha +' }).click()

    // El card de nueva fecha muestra el número siguiente (Fecha 2 ya que hay una Fecha 1)
    await expect(page.getByText('Fecha 2')).toBeVisible()
    // Muestra selectores de día y mes
    await expect(page.locator('select').first()).toBeVisible()
    // Muestra botones Guardar y Cancelar
    await expect(page.getByRole('button', { name: 'Guardar' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Cancelar' })).toBeVisible()
  })

  test('cancelar nueva fecha oculta el formulario', async ({ page }) => {
    await setScenario('fixture_con_fechas')
    await login(page)
    await page.goto(FIXTURE_URL)

    await page.getByRole('button', { name: 'Agregar fecha +' }).click()
    await expect(page.getByText('Fecha 2')).toBeVisible()

    await page.getByRole('button', { name: 'Cancelar' }).click()
    await expect(page.getByText('Fecha 2')).not.toBeVisible()
  })

  test('guardar nueva fecha llama al POST y muestra toast de éxito', async ({
    page
  }) => {
    await setScenario('fixture_con_fechas')
    await login(page)
    await page.goto(FIXTURE_URL)

    await page.route('**/api/TorneoZona/*/fechas', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id: 2, numero: 2, dia: null, jornadas: [] })
        })
      } else {
        await route.continue()
      }
    })

    await page.getByRole('button', { name: 'Agregar fecha +' }).click()
    await page.getByRole('button', { name: 'Guardar' }).click()

    await expect(page.getByText('Fecha creada')).toBeVisible()
  })

  // -------------------------------------------------------------------------
  // Editar fecha existente
  // -------------------------------------------------------------------------

  test('al clic en el lápiz se activa el modo edición con selectores de día y mes', async ({
    page
  }) => {
    await setScenario('fixture_con_fechas')
    await login(page)
    await page.goto(FIXTURE_URL)

    // El encabezado de Fecha 1 tiene el primer botón = editar
    await page
      .locator('h3', { hasText: 'Fecha 1' })
      .locator('..')
      .locator('..')
      .locator('button')
      .first()
      .click()

    // Aparecen los selects de día y mes
    await expect(page.locator('select').first()).toBeVisible()
    // Y los botones de acción
    await expect(page.getByRole('button', { name: 'Guardar' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Cancelar' })).toBeVisible()
  })

  test('cancelar edición vuelve al modo vista', async ({ page }) => {
    await setScenario('fixture_con_fechas')
    await login(page)
    await page.goto(FIXTURE_URL)

    await page
      .locator('h3', { hasText: 'Fecha 1' })
      .locator('..')
      .locator('..')
      .locator('button')
      .first()
      .click()

    await expect(page.getByRole('button', { name: 'Guardar' })).toBeVisible()

    await page.getByRole('button', { name: 'Cancelar' }).click()

    await expect(
      page.getByRole('button', { name: 'Guardar' })
    ).not.toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Cancelar' })
    ).not.toBeVisible()
    // Los equipos siguen visibles en modo vista
    await expect(page.getByText('Infantil A')).toBeVisible()
  })

  test('guardar edición de fecha llama al PUT y muestra toast de éxito', async ({
    page
  }) => {
    await setScenario('fixture_con_fechas')
    await login(page)
    await page.goto(FIXTURE_URL)

    let bodyEnviado: unknown = null
    await page.route('**/api/TorneoZona/*/fechas/*', async (route) => {
      if (route.request().method() === 'PUT') {
        bodyEnviado = JSON.parse(route.request().postData() ?? '{}')
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id: 1, numero: 1, dia: null, jornadas: [] })
        })
      } else {
        await route.continue()
      }
    })

    // Abrir modo edición
    await page
      .locator('h3', { hasText: 'Fecha 1' })
      .locator('..')
      .locator('..')
      .locator('button')
      .first()
      .click()

    // Seleccionar mes Mayo (índice 4) y luego día 10
    await page.locator('select').first().selectOption('4')
    await page.locator('select').nth(1).selectOption('10')

    await page.getByRole('button', { name: 'Guardar' }).click()

    await expect(page.getByText('Fecha actualizada')).toBeVisible()
    expect(bodyEnviado).toBeTruthy()
  })

  // -------------------------------------------------------------------------
  // Eliminar fecha
  // -------------------------------------------------------------------------

  test('el botón eliminar muestra el modal de confirmación', async ({
    page
  }) => {
    await setScenario('fixture_con_fechas')
    await login(page)
    await page.goto(FIXTURE_URL)

    // Segundo botón del header = eliminar (visible para admin)
    await page
      .locator('h3', { hasText: 'Fecha 1' })
      .locator('..')
      .locator('..')
      .locator('button')
      .nth(1)
      .click()

    await expect(
      page.getByText('¿Confirmás que querés eliminar la Fecha 1?', {
        exact: false
      })
    ).toBeVisible()
  })

  test('confirmar eliminación llama al DELETE y muestra toast', async ({
    page
  }) => {
    await setScenario('fixture_con_fechas')
    await login(page)
    await page.goto(FIXTURE_URL)

    await page.route('**/api/TorneoZona/*/fechas/*', async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(1)
        })
      } else {
        await route.continue()
      }
    })

    // Abrir modal de confirmación
    await page
      .locator('h3', { hasText: 'Fecha 1' })
      .locator('..')
      .locator('..')
      .locator('button')
      .nth(1)
      .click()

    // Confirmar eliminación
    await page.getByRole('button', { name: 'Eliminar fecha' }).click()

    await expect(page.getByText('Fecha eliminada')).toBeVisible()
  })

  // -------------------------------------------------------------------------
  // Día en el header
  // -------------------------------------------------------------------------

  test('si la fecha tiene día lo muestra en el header como "dd/mm"', async ({
    page
  }) => {
    await setScenario('fixture_con_fechas_con_dia')
    await login(page)
    await page.goto(FIXTURE_URL)

    // dia = 2026-05-15 → debe mostrar "15/5"
    await expect(page.getByText('— 15/5')).toBeVisible()
  })

  test('el modo edición pre-selecciona el día y mes actuales de la fecha', async ({
    page
  }) => {
    await setScenario('fixture_con_fechas_con_dia')
    await login(page)
    await page.goto(FIXTURE_URL)

    await page
      .locator('h3', { hasText: 'Fecha 1' })
      .locator('..')
      .locator('..')
      .locator('button')
      .first()
      .click()

    // mes = 4 (Mayo, índice 4 en 0-indexed), día = 15
    await expect(page.locator('select').first()).toHaveValue('4')
    await expect(page.locator('select').nth(1)).toHaveValue('15')
  })
})

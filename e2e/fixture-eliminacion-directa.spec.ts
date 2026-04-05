import { expect, test } from '@playwright/test'
import { login, setScenario } from './helpers'

// Fase 200 (tipoDeFase: 2), Zona 2 (4 equipos)
const FIXTURE_URL_ED = '/torneos/detalle/1/fases/200/zonas/2/fixture'

test.describe('Fixture — Eliminación Directa', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeEach(async () => {
    await setScenario('happy')
  })
  test.afterEach(async () => {
    await setScenario('happy')
  })

  // -------------------------------------------------------------------------
  // PanelEliminacionDirecta — sin fechas, cantidad de equipos
  // -------------------------------------------------------------------------

  test('con cantidad inválida de equipos el botón está deshabilitado y muestra el mensaje de error', async ({
    page
  }) => {
    await setScenario('fixture_eliminacion_directa_3_equipos')
    await login(page)
    await page.goto(FIXTURE_URL_ED)

    await expect(
      page.getByRole('button', { name: 'Generar vista previa' })
    ).toBeDisabled()
    await expect(
      page.getByText('La cantidad de equipos tiene que ser 2, 4, 8 o 16')
    ).toBeVisible()
  })

  test('con 4 equipos (válido) el botón "Generar vista previa" está habilitado', async ({
    page
  }) => {
    await setScenario('fixture_eliminacion_directa_sin_fechas')
    await login(page)
    await page.goto(FIXTURE_URL_ED)

    await expect(
      page.getByRole('button', { name: 'Generar vista previa' })
    ).toBeEnabled()
  })

  test('muestra la lista de equipos ordenada alfabéticamente', async ({
    page
  }) => {
    await setScenario('fixture_eliminacion_directa_sin_fechas')
    await login(page)
    await page.goto(FIXTURE_URL_ED)

    const liItems = page.locator('li').filter({ hasText: /Infantil/ })
    await expect(liItems).toHaveCount(4)
    await expect(liItems.nth(0)).toContainText('Infantil A')
    await expect(liItems.nth(1)).toContainText('Infantil B')
    await expect(liItems.nth(2)).toContainText('Infantil C')
    await expect(liItems.nth(3)).toContainText('Infantil D')
  })

  // -------------------------------------------------------------------------
  // PanelEliminacionDirecta — vista previa del bracket
  // -------------------------------------------------------------------------

  test('al generar vista previa aparecen las columnas Semifinal y Final', async ({
    page
  }) => {
    await setScenario('fixture_eliminacion_directa_sin_fechas')
    await login(page)
    await page.goto(FIXTURE_URL_ED)

    await page.getByRole('button', { name: 'Generar vista previa' }).click()

    await expect(page.getByText('Semifinal')).toBeVisible()
    await expect(page.getByText('Final', { exact: true })).toBeVisible()
  })

  test('la primera ronda del bracket muestra los equipos en el orden correcto', async ({
    page
  }) => {
    await setScenario('fixture_eliminacion_directa_sin_fechas')
    await login(page)
    await page.goto(FIXTURE_URL_ED)

    await page.getByRole('button', { name: 'Generar vista previa' }).click()

    // Esperar que aparezca la vista previa
    await expect(
      page.getByRole('button', { name: /Crear el fixture/ })
    ).toBeVisible()

    // PartidoCardBracket usa 'rounded border bg-card' (shadcn Card usa 'rounded-lg')
    const partidoCards = page.locator('.rounded.border.bg-card')

    // Partido 1 (Semifinal): Infantil A (local) vs Infantil B (visitante)
    await expect(partidoCards.nth(0)).toContainText('Infantil A')
    await expect(partidoCards.nth(0)).toContainText('Infantil B')

    // Partido 2 (Semifinal): Infantil C (local) vs Infantil D (visitante)
    await expect(partidoCards.nth(1)).toContainText('Infantil C')
    await expect(partidoCards.nth(1)).toContainText('Infantil D')
  })

  test('la Final muestra "Por definir" (equipos aún no determinados)', async ({
    page
  }) => {
    await setScenario('fixture_eliminacion_directa_sin_fechas')
    await login(page)
    await page.goto(FIXTURE_URL_ED)

    await page.getByRole('button', { name: 'Generar vista previa' }).click()

    await expect(page.getByText('Por definir').first()).toBeVisible()
  })

  test('drag reordena equipos y el bracket refleja el nuevo orden', async ({
    page
  }) => {
    await setScenario('fixture_eliminacion_directa_sin_fechas')
    await login(page)
    await page.goto(FIXTURE_URL_ED)

    const liItems = page.locator('li').filter({ hasText: /Infantil/ })

    // Arrastrar Infantil B encima de Infantil A
    const boxB = (await liItems.nth(1).boundingBox())!
    const boxA = (await liItems.nth(0).boundingBox())!

    await page.mouse.move(boxB.x + boxB.width / 2, boxB.y + boxB.height / 2)
    await page.mouse.down()
    await page.mouse.move(boxB.x + boxB.width / 2 + 10, boxB.y + boxB.height / 2)
    await page.mouse.move(boxA.x + boxA.width / 2, boxA.y + boxA.height / 2, { steps: 20 })
    await page.mouse.up()

    // Verificar nuevo orden en la lista
    await expect(liItems.nth(0)).toContainText('Infantil B')
    await expect(liItems.nth(1)).toContainText('Infantil A')

    const btnGenerar = page.getByRole('button', { name: 'Generar vista previa' })
    await btnGenerar.scrollIntoViewIfNeeded()
    await btnGenerar.click()

    // Esperar que el bracket renderice antes de buscar las cards
    await expect(
      page.getByRole('button', { name: /Crear el fixture/ })
    ).toBeVisible()

    // En el bracket, Infantil B debe aparecer en el primer partido (fue arrastrado al lugar 1)
    await expect(
      page.locator('.rounded.border.bg-card').first()
    ).toContainText('Infantil B')
  })

  // -------------------------------------------------------------------------
  // PanelEliminacionDirecta — crear llave
  // -------------------------------------------------------------------------

  test('crear la llave llama al endpoint de eliminación directa, no al de todos contra todos', async ({
    page
  }) => {
    await setScenario('fixture_eliminacion_directa_sin_fechas')
    await login(page)
    await page.goto(FIXTURE_URL_ED)

    let urlLlamada = ''
    await page.route(
      '**/api/Zona/*/fechas/crear-fechas-eliminaciondirecta-masivamente',
      async (route) => {
        urlLlamada = route.request().url()
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({})
        })
      }
    )

    await page.getByRole('button', { name: 'Generar vista previa' }).click()
    await page.getByRole('button', { name: /Crear el fixture/ }).click()

    await expect(page.getByText('Fechas y jornadas creadas correctamente')).toBeVisible()
    expect(urlLlamada).toContain('crear-fechas-eliminaciondirecta-masivamente')
  })

  test('crear la llave envía el body correcto: primera ronda con equipos, rondas posteriores sin equipos', async ({
    page
  }) => {
    await setScenario('fixture_eliminacion_directa_sin_fechas')
    await login(page)
    await page.goto(FIXTURE_URL_ED)

    let bodyEnviado: unknown = null
    await page.route(
      '**/api/Zona/*/fechas/crear-fechas-eliminaciondirecta-masivamente',
      async (route) => {
        if (route.request().method() === 'POST') {
          bodyEnviado = JSON.parse(route.request().postData() ?? '{}')
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({})
        })
      }
    )

    await page.getByRole('button', { name: 'Generar vista previa' }).click()
    await page.getByRole('button', { name: /Crear el fixture/ }).click()

    await expect(page.getByText('Fechas y jornadas creadas correctamente')).toBeVisible()

    expect(bodyEnviado).toBeTruthy()
    const body = bodyEnviado as {
      instanciaId: number
      jornadas: Array<{ tipo: string; localId?: number; visitanteId?: number }>
    }
    // instanciaId = n = 4 (cantidad de equipos)
    expect(body.instanciaId).toBe(4)
    // 2 jornadas: A vs B y C vs D
    expect(body.jornadas).toHaveLength(2)
    expect(body.jornadas[0].tipo).toBe('Normal')
    expect(body.jornadas[0].localId).toBe(1)
    expect(body.jornadas[0].visitanteId).toBe(2)
    expect(body.jornadas[1].tipo).toBe('Normal')
    expect(body.jornadas[1].localId).toBe(3)
    expect(body.jornadas[1].visitanteId).toBe(4)
  })

  // -------------------------------------------------------------------------
  // FechasEliminacionDirecta — visualización de la llave
  // -------------------------------------------------------------------------

  test('con fechas existentes muestra las columnas de la llave (Semifinal y Final)', async ({
    page
  }) => {
    await setScenario('fixture_eliminacion_directa_con_fechas')
    await login(page)
    await page.goto(FIXTURE_URL_ED)

    await expect(page.getByText('Semifinal')).toBeVisible()
    await expect(page.getByText('Final', { exact: true })).toBeVisible()
  })

  test('la Semifinal muestra los nombres de los equipos', async ({ page }) => {
    await setScenario('fixture_eliminacion_directa_con_fechas')
    await login(page)
    await page.goto(FIXTURE_URL_ED)

    await expect(page.getByText('Infantil A')).toBeVisible()
    await expect(page.getByText('Infantil B')).toBeVisible()
    await expect(page.getByText('Infantil C')).toBeVisible()
    await expect(page.getByText('Infantil D')).toBeVisible()
  })

  test('la Final muestra "Por definir" mientras no hay resultado de la Semifinal', async ({
    page
  }) => {
    await setScenario('fixture_eliminacion_directa_con_fechas')
    await login(page)
    await page.goto(FIXTURE_URL_ED)

    await expect(page.getByText('Por definir').first()).toBeVisible()
  })

  test('no se muestra la lista de equipos ni el botón de generar (hay fechas creadas)', async ({
    page
  }) => {
    await setScenario('fixture_eliminacion_directa_con_fechas')
    await login(page)
    await page.goto(FIXTURE_URL_ED)

    await expect(
      page.getByText('Orden de equipos (arrastrá para reordenar)')
    ).not.toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Generar vista previa' })
    ).not.toBeVisible()
  })

  // -------------------------------------------------------------------------
  // FechasEliminacionDirecta — carga de resultados por ronda
  // -------------------------------------------------------------------------

  test('el botón cargar resultados abre el modal con los partidos de la Semifinal', async ({
    page
  }) => {
    await setScenario('fixture_eliminacion_directa_con_fechas')
    await login(page)
    await page.goto(FIXTURE_URL_ED)

    // El botón de la Semifinal (primera columna con jornadas cargables)
    await page
      .getByTestId('btn-carga-resultados-jornada')
      .first()
      .click()

    const dialog = page.getByRole('dialog')
    await expect(
      dialog.getByRole('heading', { name: 'Cargar resultados' })
    ).toBeVisible()
    await expect(dialog.getByText('Semifinal')).toBeVisible()
    // Dos partidos: A vs B y C vs D
    await expect(dialog.getByRole('textbox', { name: /Resultado local, Infantil A/ })).toBeVisible()
    await expect(dialog.getByRole('textbox', { name: /Resultado local, Infantil C/ })).toBeVisible()
  })

  test('guardar resultados de la Semifinal envía un POST por jornada con el body correcto', async ({
    page
  }) => {
    await setScenario('fixture_eliminacion_directa_con_fechas')
    await login(page)
    await page.goto(FIXTURE_URL_ED)

    const bodies: unknown[] = []
    await page.route(
      '**/api/Zona/*/fechas/cargar-resultados/*',
      async (route) => {
        if (route.request().method() === 'POST') {
          bodies.push(JSON.parse(route.request().postData() ?? '{}'))
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: ''
        })
      }
    )

    await page.getByTestId('btn-carga-resultados-jornada').first().click()

    const dialog = page.getByRole('dialog')
    await dialog
      .getByRole('textbox', { name: /Resultado local, Infantil A/ })
      .fill('2')
    await dialog
      .getByRole('textbox', { name: /Resultado visitante, Infantil B/ })
      .fill('1')
    await dialog.getByRole('button', { name: 'Guardar' }).click()

    await expect(page.getByText('Resultados guardados')).toBeVisible()

    // La Semifinal tiene 2 jornadas → 2 POST (uno por cada partido de la ronda)
    expect(bodies).toHaveLength(2)
    const primerBody = bodies[0] as {
      jornadaId: number
      resultadosVerificados: boolean
      partidos: Array<{ resultadoLocal: string; resultadoVisitante: string }>
    }
    expect(primerBody.jornadaId).toBe(10)
    expect(primerBody.resultadosVerificados).toBe(false)
    expect(primerBody.partidos[0].resultadoLocal).toBe('2')
    expect(primerBody.partidos[0].resultadoVisitante).toBe('1')
  })

  // -------------------------------------------------------------------------
  // FechasEliminacionDirecta — borrar llave
  // -------------------------------------------------------------------------

  test('el botón "Borrar llave de eliminación" muestra el modal de confirmación', async ({
    page
  }) => {
    await setScenario('fixture_eliminacion_directa_con_fechas')
    await login(page)
    await page.goto(FIXTURE_URL_ED)

    await page.getByRole('button', { name: 'Borrar llave de eliminación' }).click()

    await expect(
      page.getByText(
        'Se eliminarán fechas y partidos de todas las instancias de esta llave.',
        { exact: false }
      )
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Borrar llave' })
    ).toBeVisible()
  })

  test('confirmar borrar llave llama al DELETE masivo y muestra toast', async ({
    page
  }) => {
    await setScenario('fixture_eliminacion_directa_con_fechas')
    await login(page)
    await page.goto(FIXTURE_URL_ED)

    let urlLlamada = ''
    await page.route(
      '**/api/Zona/*/fechas/borrar-fechas-eliminaciondirecta-masivamente',
      async (route) => {
        urlLlamada = route.request().url()
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: 'null'
        })
      }
    )

    await page.getByRole('button', { name: 'Borrar llave de eliminación' }).click()
    await page.getByRole('button', { name: 'Borrar llave' }).click()

    await expect(page.getByText('Llave de eliminación borrada')).toBeVisible()
    expect(urlLlamada).toContain('borrar-fechas-eliminaciondirecta-masivamente')
  })

  test('después de borrar la llave se vuelve al panel de generación', async ({
    page
  }) => {
    await setScenario('fixture_eliminacion_directa_con_fechas')
    await login(page)
    await page.goto(FIXTURE_URL_ED)

    await page.route(
      '**/api/Zona/*/fechas/borrar-fechas-eliminaciondirecta-masivamente',
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: 'null'
        })
      }
    )

    await page.getByRole('button', { name: 'Borrar llave de eliminación' }).click()

    // Cambiar el escenario antes del refetch para simular que ya no hay fechas
    await setScenario('fixture_eliminacion_directa_sin_fechas')
    await page.getByRole('button', { name: 'Borrar llave' }).click()

    await expect(page.getByText('Llave de eliminación borrada')).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Generar vista previa' })
    ).toBeVisible()
  })
})

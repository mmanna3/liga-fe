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

  test('el botón "Generar fixture" está habilitado cuando el algoritmo tiene fechas', async ({
    page
  }) => {
    await setScenario('fixture_sin_fechas')
    await login(page)
    await page.goto(FIXTURE_URL)

    await expect(
      page.getByRole('button', { name: 'Generar fixture' })
    ).toBeEnabled()
  })

  test('el botón "Generar fixture" está deshabilitado cuando el algoritmo no tiene fechas configuradas', async ({
    page
  }) => {
    await setScenario('fixture_algoritmo_sin_configurar')
    await login(page)
    await page.goto(FIXTURE_URL)

    await expect(
      page.getByRole('button', { name: 'Generar fixture' })
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
  // Flujo "Generar fixture"
  // -------------------------------------------------------------------------

  test('al clic en "Generar fixture" desaparece la lista y se muestran las fechas del algoritmo', async ({
    page
  }) => {
    await setScenario('fixture_sin_fechas')
    await login(page)
    await page.goto(FIXTURE_URL)

    await page.getByRole('button', { name: 'Generar fixture' }).click()

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

    await page.getByRole('button', { name: 'Generar fixture' }).click()

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

    await page.getByRole('button', { name: 'Generar fixture' }).click()
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
        localEquipoId: number
        visitanteEquipoId: number
      }>
    }>
    expect(body).toHaveLength(1)
    expect(body[0].numero).toBe(1)
    expect(body[0].esVisibleEnApp).toBe(false)
    expect(body[0].jornadas).toHaveLength(1)
    expect(body[0].jornadas[0].tipo).toBe('Normal')
    expect(body[0].jornadas[0].resultadosVerificados).toBe(false)
    expect(body[0].jornadas[0].localEquipoId).toBe(1)
    expect(body[0].jornadas[0].visitanteEquipoId).toBe(2)
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
      page.getByRole('button', { name: 'Generar fixture' })
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
})

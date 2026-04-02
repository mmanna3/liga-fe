import { expect, test } from '@playwright/test'
import { login, setScenario } from './helpers'

const FIXTURE_URL = '/torneos/detalle/1/fases/100/zonas/1/fixture'

test.describe('Fixture', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeEach(async () => {
    await setScenario('happy')
  })
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

  test('al clic en "Generar vista previa del fixture" se muestran las cards con las fechas del algoritmo', async ({
    page
  }) => {
    await setScenario('fixture_sin_fechas')
    await login(page)
    await page.goto(FIXTURE_URL)

    await page
      .getByRole('button', { name: 'Generar vista previa del fixture' })
      .click()

    await expect(page.getByText('Fecha 1')).toBeVisible()
    await expect(
      page.getByRole('button', { name: /Crear el fixture/ })
    ).toBeVisible()
  })

  test('luego de generar el fixture muestra el botón para crear y el texto informativo', async ({
    page
  }) => {
    await setScenario('fixture_sin_fechas')
    await login(page)
    await page.goto(FIXTURE_URL)

    await page
      .getByRole('button', { name: 'Generar vista previa del fixture' })
      .click()

    await expect(
      page.getByRole('button', { name: /Crear el fixture/ })
    ).toBeVisible()
    await expect(
      page.getByText('El fixture generado', { exact: false })
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
      '**/api/Zona/*/fechas/crear-fechas-masivamente',
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
    await page.getByRole('button', { name: /Crear el fixture/ }).click()
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
    // Muestra el selector de fecha (Calendario)
    await expect(page.getByText('Seleccioná una fecha')).toBeVisible()
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

    await page.route('**/api/Zona/*/fechas', async (route) => {
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

  test('al clic en el lápiz se activa el modo edición con el selector de fecha', async ({
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

    // Aparece el selector de fecha (Calendario)
    await expect(page.getByText('Seleccioná una fecha')).toBeVisible()
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
    await page.route('**/api/Zona/*/fechas/*', async (route) => {
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

    await page.route('**/api/Zona/*/fechas/*', async (route) => {
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

  test('el modo edición pre-selecciona la fecha actual en el selector', async ({
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

    // dia = 2026-05-15 → el Calendario debe mostrar la fecha formateada
    await expect(
      page.getByText('15 de mayo de 2026', { exact: false })
    ).toBeVisible()
  })

  // -------------------------------------------------------------------------
  // Cambiar primera fecha → actualiza preview del fixture
  // -------------------------------------------------------------------------

  test('cambiar la primera fecha actualiza las fechas en las cards del fixture generado', async ({
    page
  }) => {
    await setScenario('fixture_sin_fechas')
    await login(page)
    // Fijar el reloj del navegador en marzo 2026 antes de cargar la página,
    // para que el date picker monte con esa fecha y no dependa de la fecha actual
    await page.clock.setFixedTime(new Date('2026-03-15T12:00:00Z'))
    await page.goto(FIXTURE_URL)

    // Abrir el Calendario del selector "¿Cuándo es la primera fecha?"
    await page
      .getByText('¿Cuándo es la primera fecha?')
      .locator('xpath=../..//button')
      .click()

    // Navegar al mes siguiente (abril 2026)
    await page.locator('.rdp-button_next').click()

    // Seleccionar el día 15 de abril de 2026
    await page.locator('[data-day="15/4/2026"]').click()

    // Generar la vista previa del fixture
    await page
      .getByRole('button', { name: 'Generar vista previa del fixture' })
      .click()

    // La card de Fecha 1 debe mostrar "miércoles 15 de abril" (abril 15, 2026 = miércoles)
    await expect(page.getByText('miércoles 15 de abril')).toBeVisible()
  })

  // -------------------------------------------------------------------------
  // Reordenar equipos con drag-and-drop
  // -------------------------------------------------------------------------

  test('la lista de equipos se muestra en el orden correcto', async ({
    page
  }) => {
    await setScenario('fixture_sin_fechas')
    await login(page)
    await page.goto(FIXTURE_URL)

    await expect(
      page.getByText('Orden de equipos (arrastrá para reordenar)')
    ).toBeVisible()

    // Orden inicial: alfabético por nombre (Infantil A antes que Infantil B)
    // labelItem incluye: codigo · nombre · club
    const liItems = page.locator('li').filter({ hasText: /Infantil/ })
    await expect(liItems).toHaveCount(2)
    await expect(liItems.nth(0)).toContainText('Infantil A')
    await expect(liItems.nth(1)).toContainText('Infantil B')

    // Reordenar: arrastrar Infantil B encima de Infantil A usando page.mouse
    // dnd-kit usa PointerSensor con activationConstraint distance=8
    await liItems.nth(1).scrollIntoViewIfNeeded()
    const boxB = (await liItems.nth(1).boundingBox())!
    const boxA = (await liItems.nth(0).boundingBox())!

    const srcX = boxB.x + boxB.width / 2
    const srcY = boxB.y + boxB.height / 2
    const tgtX = boxA.x + boxA.width / 2
    const tgtY = boxA.y + boxA.height / 2

    await page.mouse.move(srcX, srcY)
    await page.mouse.down()
    // Mover > 8px para activar el sensor
    await page.mouse.move(srcX + 10, srcY)
    await page.mouse.move(tgtX, tgtY, { steps: 20 })
    await page.mouse.up()

    // Verificar que el reorden se aplicó
    await expect(liItems.nth(0)).toContainText('Infantil B')
    await expect(liItems.nth(1)).toContainText('Infantil A')
  })

  // -------------------------------------------------------------------------
  // Agregar jornada a fecha existente
  // -------------------------------------------------------------------------

  test('agregar jornada a fecha existente abre el modal con slots LOCAL y VISITANTE', async ({
    page
  }) => {
    await setScenario('fixture_con_fechas')
    await login(page)
    await page.goto(FIXTURE_URL)

    // Entrar en modo edición de Fecha 1
    await page
      .locator('h3', { hasText: 'Fecha 1' })
      .locator('..')
      .locator('..')
      .locator('button')
      .first()
      .click()

    // Clic en "Agregar jornada +" → abre el modal
    await page.getByText('Agregar jornada +').click()

    // El modal debe mostrar el título y los slots
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Agregar jornada' })).toBeVisible()
    await expect(dialog.getByText('LOCAL')).toBeVisible()
    await expect(dialog.getByText('VISITANTE')).toBeVisible()

    // El botón Agregar está deshabilitado (slots vacíos)
    await expect(dialog.getByRole('button', { name: 'Agregar' })).toBeDisabled()
  })

  // -------------------------------------------------------------------------
  // Completar el modal de agregar jornada (drag → confirmar)
  // -------------------------------------------------------------------------

  test('completar el modal: drag de equipos a slots habilita el botón Agregar', async ({
    page
  }) => {
    await setScenario('fixture_con_fechas')
    await login(page)
    await page.goto(FIXTURE_URL)

    // Entrar en modo edición y abrir el modal
    await page
      .locator('h3', { hasText: 'Fecha 1' })
      .locator('..')
      .locator('..')
      .locator('button')
      .first()
      .click()
    await page.getByText('Agregar jornada +').click()

    const dialog = page.getByRole('dialog')

    // Localizar los slots (el div padre del label LOCAL/VISITANTE)
    const localSlot = dialog
      .locator('p')
      .filter({ hasText: /^LOCAL$/ })
      .locator('xpath=parent::div')
    const visitanteSlot = dialog
      .locator('p')
      .filter({ hasText: /^VISITANTE$/ })
      .locator('xpath=parent::div')

    // Arrastar Infantil A → LOCAL, Infantil B → VISITANTE
    // Usamos page.mouse para activar el PointerSensor de dnd-kit (distance: 8)
    const itemA = dialog.getByText('Infantil A').first()
    const itemB = dialog.getByText('Infantil B').first()

    const boxA = (await itemA.boundingBox())!
    const tgtLocal = (await localSlot.boundingBox())!
    await page.mouse.move(boxA.x + boxA.width / 2, boxA.y + boxA.height / 2)
    await page.mouse.down()
    await page.mouse.move(boxA.x + boxA.width / 2 + 10, boxA.y + boxA.height / 2)
    await page.mouse.move(
      tgtLocal.x + tgtLocal.width / 2,
      tgtLocal.y + tgtLocal.height / 2,
      { steps: 20 }
    )
    await page.mouse.up()

    const boxB = (await itemB.boundingBox())!
    const tgtVisitante = (await visitanteSlot.boundingBox())!
    await page.mouse.move(boxB.x + boxB.width / 2, boxB.y + boxB.height / 2)
    await page.mouse.down()
    await page.mouse.move(boxB.x + boxB.width / 2 + 10, boxB.y + boxB.height / 2)
    await page.mouse.move(
      tgtVisitante.x + tgtVisitante.width / 2,
      tgtVisitante.y + tgtVisitante.height / 2,
      { steps: 20 }
    )
    await page.mouse.up()

    // Con ambos slots llenos, el botón debe habilitarse
    await expect(dialog.getByRole('button', { name: 'Agregar' })).toBeEnabled()
  })

  test('completar el modal: clic en Agregar cierra el modal y la jornada queda en el borrador', async ({
    page
  }) => {
    await setScenario('fixture_con_fechas')
    await login(page)
    await page.goto(FIXTURE_URL)

    // Entrar en modo edición
    await page
      .locator('h3', { hasText: 'Fecha 1' })
      .locator('..')
      .locator('..')
      .locator('button')
      .first()
      .click()
    await page.getByText('Agregar jornada +').click()

    const dialog = page.getByRole('dialog')

    const localSlot = dialog
      .locator('p')
      .filter({ hasText: /^LOCAL$/ })
      .locator('xpath=parent::div')
    const visitanteSlot = dialog
      .locator('p')
      .filter({ hasText: /^VISITANTE$/ })
      .locator('xpath=parent::div')

    const itemA = dialog.getByText('Infantil A').first()
    const itemB = dialog.getByText('Infantil B').first()

    const boxA = (await itemA.boundingBox())!
    const tgtLocal = (await localSlot.boundingBox())!
    await page.mouse.move(boxA.x + boxA.width / 2, boxA.y + boxA.height / 2)
    await page.mouse.down()
    await page.mouse.move(boxA.x + boxA.width / 2 + 10, boxA.y + boxA.height / 2)
    await page.mouse.move(
      tgtLocal.x + tgtLocal.width / 2,
      tgtLocal.y + tgtLocal.height / 2,
      { steps: 20 }
    )
    await page.mouse.up()

    const boxB = (await itemB.boundingBox())!
    const tgtVisitante = (await visitanteSlot.boundingBox())!
    await page.mouse.move(boxB.x + boxB.width / 2, boxB.y + boxB.height / 2)
    await page.mouse.down()
    await page.mouse.move(boxB.x + boxB.width / 2 + 10, boxB.y + boxB.height / 2)
    await page.mouse.move(
      tgtVisitante.x + tgtVisitante.width / 2,
      tgtVisitante.y + tgtVisitante.height / 2,
      { steps: 20 }
    )
    await page.mouse.up()

    await dialog.getByRole('button', { name: 'Agregar' }).click()

    // El modal debe cerrarse
    await expect(dialog).not.toBeVisible()

    // Ahora el modo edición sigue activo y "Agregar jornada +" sigue disponible
    await expect(page.getByText('Agregar jornada +')).toBeVisible()
  })

  test('completar el modal: guardar la fecha envía PUT con la jornada agregada', async ({
    page
  }) => {
    await setScenario('fixture_con_fechas')
    await login(page)
    await page.goto(FIXTURE_URL)

    // Entrar en modo edición
    await page
      .locator('h3', { hasText: 'Fecha 1' })
      .locator('..')
      .locator('..')
      .locator('button')
      .first()
      .click()
    await page.getByText('Agregar jornada +').click()

    const dialog = page.getByRole('dialog')

    const localSlot = dialog
      .locator('p')
      .filter({ hasText: /^LOCAL$/ })
      .locator('xpath=parent::div')
    const visitanteSlot = dialog
      .locator('p')
      .filter({ hasText: /^VISITANTE$/ })
      .locator('xpath=parent::div')

    const itemA = dialog.getByText('Infantil A').first()
    const itemB = dialog.getByText('Infantil B').first()

    const boxA = (await itemA.boundingBox())!
    const tgtLocal = (await localSlot.boundingBox())!
    await page.mouse.move(boxA.x + boxA.width / 2, boxA.y + boxA.height / 2)
    await page.mouse.down()
    await page.mouse.move(boxA.x + boxA.width / 2 + 10, boxA.y + boxA.height / 2)
    await page.mouse.move(
      tgtLocal.x + tgtLocal.width / 2,
      tgtLocal.y + tgtLocal.height / 2,
      { steps: 20 }
    )
    await page.mouse.up()

    const boxB = (await itemB.boundingBox())!
    const tgtVisitante = (await visitanteSlot.boundingBox())!
    await page.mouse.move(boxB.x + boxB.width / 2, boxB.y + boxB.height / 2)
    await page.mouse.down()
    await page.mouse.move(boxB.x + boxB.width / 2 + 10, boxB.y + boxB.height / 2)
    await page.mouse.move(
      tgtVisitante.x + tgtVisitante.width / 2,
      tgtVisitante.y + tgtVisitante.height / 2,
      { steps: 20 }
    )
    await page.mouse.up()

    await dialog.getByRole('button', { name: 'Agregar' }).click()
    await expect(dialog).not.toBeVisible()

    // Interceptar el PUT y guardar
    let bodyEnviado: unknown = null
    await page.route('**/api/Zona/*/fechas/*', async (route) => {
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

    await page.getByRole('button', { name: 'Guardar' }).click()
    await expect(page.getByText('Fecha actualizada')).toBeVisible()

    expect(bodyEnviado).toBeTruthy()
    const body = bodyEnviado as { jornadas: unknown[] }
    // La fecha original tenía 1 jornada, ahora debe tener 2
    expect(body.jornadas).toHaveLength(2)
  })

  // -------------------------------------------------------------------------
  // Carga de resultados (modal)
  // -------------------------------------------------------------------------

  test('el botón de carga de resultados abre el modal con la tabla de partidos', async ({
    page
  }) => {
    await setScenario('fixture_con_fechas')
    await login(page)
    await page.goto(FIXTURE_URL)

    await page.getByTestId('btn-carga-resultados-jornada').click()

    const dialog = page.getByRole('dialog')
    await expect(
      dialog.getByRole('heading', { name: 'Cargar resultados' })
    ).toBeVisible()
    await expect(
      dialog.getByText('Fecha 1 - Infantil A vs. Infantil B')
    ).toBeVisible()
    await expect(dialog.getByText('Sub 12')).toBeVisible()
    await expect(
      dialog.getByRole('textbox', { name: /Resultado local/ })
    ).toBeVisible()
    await expect(
      dialog.getByRole('textbox', { name: /Resultado visitante/ })
    ).toBeVisible()
  })

  test('guardar resultados envía POST con los marcadores y muestra toast de éxito', async ({
    page
  }) => {
    await setScenario('fixture_con_fechas')
    await login(page)
    await page.goto(FIXTURE_URL)

    let bodyEnviado: unknown = null
    await page.route(
      '**/api/Zona/*/fechas/cargar-resultados/*',
      async (route) => {
        if (route.request().method() === 'POST') {
          bodyEnviado = JSON.parse(route.request().postData() ?? '{}')
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: ''
          })
        } else {
          await route.continue()
        }
      }
    )

    await page.getByTestId('btn-carga-resultados-jornada').click()

    const dialog = page.getByRole('dialog')
    await dialog.getByRole('textbox', { name: /Resultado local/ }).fill('2')
    await dialog.getByRole('textbox', { name: /Resultado visitante/ }).fill('1')
    await dialog.getByRole('button', { name: 'Guardar' }).click()

    await expect(page.getByText('Resultados guardados')).toBeVisible()

    expect(bodyEnviado).toBeTruthy()
    const body = bodyEnviado as {
      jornadaId: number
      resultadosVerificados: boolean
      partidos: Array<{
        id?: number
        categoriaId: number
        resultadoLocal: string
        resultadoVisitante: string
      }>
    }
    expect(body.jornadaId).toBe(1)
    expect(body.resultadosVerificados).toBe(false)
    expect(body.partidos).toHaveLength(1)
    expect(body.partidos[0].resultadoLocal).toBe('2')
    expect(body.partidos[0].resultadoVisitante).toBe('1')
    expect(body.partidos[0].categoriaId).toBe(1)
  })
})

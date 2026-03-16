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

    await page.getByRole('button', { name: 'Agregar fase' }).click()

    await expect(page.getByText('Nueva fase')).toBeVisible()
  })

  test('el torneo editable muestra botón Guardar', async ({ page }) => {
    await setScenario('torneo_editable')
    await login(page)
    await page.goto('/torneos/detalle/1')

    await expect(page.getByRole('button', { name: 'Guardar' })).toBeVisible()
  })

  // -------------------------------------------------------------------------
  // Zonas de una fase
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
})

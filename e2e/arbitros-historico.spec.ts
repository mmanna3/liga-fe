import { expect, test } from '@playwright/test'
import { login, setScenario } from './helpers'

test.describe('Asignaciones históricas de árbitros', () => {
  test.beforeEach(async () => {
    await setScenario('arbitros_historico')
  })

  test.afterEach(async () => {
    await setScenario('happy')
  })

  test('navega desde el hub y muestra asignaciones por jornada con WhatsApp', async ({
    page
  }) => {
    await login(page)
    await page.goto('/arbitros')

    await page.getByTestId('hub-asignaciones-historicas').click()
    await page.waitForURL('/arbitros/historico')

    await expect(
      page.getByText('Asignaciones históricas', { exact: true })
    ).toBeVisible()
    await expect(page.getByTestId('historico-por-jornada')).toBeVisible()
    await expect(page.getByTestId('jornada-historica-500')).toBeVisible()
    await expect(page.getByText('Infantil A')).toBeVisible()
    await expect(page.getByText('Llegar 15 min antes')).toBeVisible()
    await expect(page.getByText('Categorías: Sub 12')).toBeVisible()
  })

  test('filtra por torneo y fecha', async ({ page }) => {
    await login(page)
    await page.goto('/arbitros/historico')

    await expect(page.getByLabel('Torneo')).toBeVisible()
    await expect(page.getByLabel('Fecha')).toBeVisible()
    await expect(page.getByText('Infantil A')).toBeVisible()

    await page.getByLabel('Torneo').click()
    await page.getByRole('option', { name: 'Torneo Clausura 2026' }).click()

    await expect(page.getByText('Reserva A')).toBeVisible()
    await expect(page.getByText('Infantil A')).not.toBeVisible()
  })

  test('modo edición permite corregir asignación en jornada sin árbitros', async ({
    page
  }) => {
    await login(page)
    await page.goto('/arbitros/historico')

    await page.getByTestId('historico-modo-edicion').check()
    await expect(page.getByText('Infantil C')).toBeVisible()
    await expect(page.getByText('Árbitro 1').first()).toBeVisible()
  })

  test('muestra asignaciones por árbitro filtradas por fecha', async ({
    page
  }) => {
    await login(page)
    await page.goto('/arbitros/historico')

    await page
      .getByTestId('historico-tabs')
      .getByRole('tab', { name: 'Por árbitro' })
      .click()

    await expect(page.getByTestId('historico-por-arbitro')).toBeVisible()
    await expect(page.getByTestId('arbitro-historico-1')).toBeVisible()
    await expect(page.getByText('Uno, Juan')).toBeVisible()
    await expect(page.getByText('Llegar 15 min antes')).toBeVisible()
  })

  test('muestra estado vacío cuando no hay histórico', async ({ page }) => {
    await setScenario('arbitros_historico_vacio')
    await login(page)
    await page.goto('/arbitros/historico')

    await expect(page.getByTestId('historico-vacio-por-jornada')).toBeVisible()
    await expect(
      page.getByText('No hay fechas pasadas para este agrupador y año.')
    ).toBeVisible()
  })
})

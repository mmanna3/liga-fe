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

    await expect(page.getByText('Asignaciones históricas', { exact: true })).toBeVisible()
    await expect(page.getByTestId('historico-por-jornada')).toBeVisible()
    await expect(page.getByTestId('jornada-historica-500')).toBeVisible()
    await expect(page.getByText('Infantil A')).toBeVisible()
    await expect(page.getByText('Llegar 15 min antes')).toBeVisible()
    await expect(page.getByText('Categorías: Sub 12')).toBeVisible()
  })

  test('muestra asignaciones por árbitro', async ({ page }) => {
    await login(page)
    await page.goto('/arbitros/historico')

    await page.getByTestId('historico-tabs').getByRole('tab', { name: 'Por árbitro' }).click()

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
      page.getByText('No hay asignaciones históricas para este agrupador y año.')
    ).toBeVisible()
  })
})

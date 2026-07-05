import { expect, test } from '@playwright/test'
import { login, setScenario } from './helpers'

test.describe('Equipos prohibidos para árbitros', () => {
  test.beforeEach(async () => {
    await setScenario('arbitros_prohibidos')
  })

  test.afterEach(async () => {
    await setScenario('happy')
  })

  test('editar árbitro agrega equipo prohibido y muestra advertencia en Próxima fecha', async ({
    page
  }) => {
    await login(page)
    await page.goto('/arbitros/datos')

    await page.getByText('30111222').click()
    await expect(page.getByTestId('selector-equipos-prohibidos')).toBeVisible()

    await page
      .getByTestId('selector-equipos-prohibidos')
      .getByRole('button', { name: /Buscar equipo/ })
      .click()
    await page.getByPlaceholder('Buscar…').fill('Infantil A')
    await page.getByRole('button', { name: /A001 Infantil A/ }).click()

    await expect(page.getByText('A001 Infantil A · Club Defensores del Norte')).toBeVisible()
    await page.getByRole('button', { name: 'Guardar' }).click()
    await page.waitForURL('/arbitros/datos')

    await page.goto('/arbitros/asignacion')
    await expect(page.getByText('Infantil A vs Infantil B')).toBeVisible()

    await page.getByRole('combobox').nth(1).click()
    await page.getByPlaceholder('Buscar nombre o apellido…').fill('Juan')
    await page.getByRole('button', { name: 'Uno, Juan' }).click()
    await expect(page.getByRole('combobox').nth(1)).toContainText('Uno, Juan')

    await expect(
      page.getByText('Este equipo está prohibido para este árbitro')
    ).toBeVisible()
  })
})

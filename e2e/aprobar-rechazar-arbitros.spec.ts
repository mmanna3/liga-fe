import { expect, test } from '@playwright/test'
import { login, setScenario } from './helpers'

test.describe('Aprobación y rechazo de árbitros', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeEach(async () => {
    await setScenario('arbitros_pendientes')
  })

  test.afterEach(async () => {
    await setScenario('happy')
  })

  test('muestra los datos del árbitro pendiente con sus agrupadores precargados', async ({
    page
  }) => {
    await login(page)
    await page.goto('/arbitros')
    await page.getByTestId('hub-arbitros-pendientes').click()
    await page.waitForURL('/arbitros/pendientes')

    await page.getByText('40111222').click()
    await page.waitForURL('/arbitros/aprobar-rechazar/10')

    await expect(page.getByText('Ana Pendiente')).toBeVisible()
    await expect(page.getByText('San Martín 1234')).toBeVisible()
    await expect(page.getByText('Moto', { exact: true })).toBeVisible()
    await expect(page.getByText('Sábados de 8 a 14')).toBeVisible()
    await expect(page.getByText('Martes a viernes de 20 a 23:30')).toBeVisible()
    await expect(page.getByText('Sí: Club Defensores del Norte')).toBeVisible()
    await expect(
      page.getByRole('checkbox', { name: 'Liga Infantil' })
    ).toBeChecked()
    await expect(
      page.getByRole('checkbox', { name: 'Futsal Mayores' })
    ).not.toBeChecked()
  })

  test('aprueba con agrupador y equipo prohibido, y aparece en Datos de los árbitros', async ({
    page
  }) => {
    await login(page)
    await page.goto('/arbitros/aprobar-rechazar/10')
    await expect(page.getByText('Ana Pendiente')).toBeVisible()

    await page.getByRole('checkbox', { name: 'Futsal Mayores' }).click()
    await page
      .getByTestId('selector-equipos-prohibidos')
      .getByRole('button', { name: /Buscar equipo/ })
      .click()
    await page.getByPlaceholder('Buscar…').fill('Infantil A')
    await page.getByRole('button', { name: /A001 Infantil A/ }).click()

    await page.getByRole('button', { name: 'Aprobar' }).click()
    await page.waitForURL('/arbitros/pendientes')
    await expect(page.getByText('40333444')).toBeVisible()
    await expect(page.getByText('40111222')).not.toBeVisible()

    await page.goto('/arbitros/datos')
    const fila = page.getByRole('row', { name: /40111222/ })
    await expect(fila).toBeVisible()
    await expect(fila).toContainText('Liga Infantil, Futsal Mayores')

    await fila.click()
    await expect(
      page.getByText('A001 Infantil A · Club Defensores del Norte')
    ).toBeVisible()
  })

  test('editar un árbitro aprobado conserva los datos que cargó desde la app', async ({
    page
  }) => {
    await login(page)
    await page.goto('/arbitros/aprobar-rechazar/10')
    await expect(page.getByText('Ana Pendiente')).toBeVisible()
    await page.getByRole('button', { name: 'Aprobar' }).click()
    await page.waitForURL('/arbitros/pendientes')

    await page.goto('/arbitros/editar/10')
    await expect(page.locator('#localidad')).toHaveValue('Rosario')
    await page.locator('#localidad').fill('Funes')
    await page.getByRole('button', { name: 'Guardar' }).click()
    await page.waitForURL('/arbitros/datos')

    await page.getByRole('row', { name: /40111222/ }).click()
    await expect(page.locator('#localidad')).toHaveValue('Funes')
    await expect(page.locator('#direccion')).toHaveValue('San Martín 1234')
    await expect(page.locator('#fecha-nacimiento')).toHaveValue('1995-03-20')
    await expect(
      page.getByRole('checkbox', { name: 'Sábados de 8 a 14' })
    ).toBeChecked()
    await expect(
      page.getByRole('checkbox', { name: 'Martes a viernes de 20 a 23:30' })
    ).toBeChecked()
    await expect(page.locator('#institucion')).toHaveValue(
      'Club Defensores del Norte'
    )
  })

  test('rechaza un árbitro y desaparece de los pendientes', async ({
    page
  }) => {
    await login(page)
    await page.goto('/arbitros/pendientes')
    await page.getByText('40333444').click()
    await page.waitForURL('/arbitros/aprobar-rechazar/11')
    await expect(page.getByText('Beto Rechazable')).toBeVisible()

    await page.getByRole('button', { name: 'Rechazar' }).click()
    await page.getByRole('button', { name: 'Rechazar definitivamente' }).click()

    await page.waitForURL('/arbitros/pendientes')
    await expect(page.getByText('40111222')).toBeVisible()
    await expect(page.getByText('40333444')).not.toBeVisible()

    await page.goto('/arbitros/datos')
    await expect(page.getByText('30111222')).toBeVisible()
    await expect(page.getByText('40333444')).not.toBeVisible()
  })
})

import { expect, test } from '@playwright/test'
import { login, setScenario } from './helpers'

test.describe('Clubes', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeEach(async () => {
    await setScenario('happy')
  })
  test.afterEach(async () => {
    await setScenario('happy')
  })

  test('muestra lista vacía cuando no hay clubes', async ({ page }) => {
    await login(page)
    await page.goto('/clubs')
    await expect(page.getByText('No se encontraron resultados.')).toBeVisible()
    await expect(page.getByText('Registros: 0')).toBeVisible()
  })

  test('muestra los clubes en la tabla cuando hay datos', async ({ page }) => {
    await setScenario('clubs_con_datos')
    await login(page)
    await page.goto('/clubs')

    await expect(page.getByText('Club Defensores del Norte')).toBeVisible()
    await expect(page.getByText('Atlético San Martín')).toBeVisible()
    await expect(page.getByText('Registros: 2')).toBeVisible()
  })

  test('navega a la pantalla de crear club', async ({ page }) => {
    await login(page)
    await page.goto('/clubs/crear')
    await expect(page.getByText('Crear Club')).toBeVisible()
    await expect(page.getByLabel('Nombre')).toBeVisible()
    await expect(page.getByText('Cancha')).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Descubierta', exact: true })
    ).toBeVisible()
  })

  test('crea un club y regresa a la lista', async ({ page }) => {
    await login(page)
    await page.goto('/clubs/crear')

    await page.getByLabel('Nombre').fill('Club de Prueba E2E')
    await page.getByLabel('Dirección').fill('Calle Falsa 123')
    await page.getByRole('button', { name: 'Guardar' }).click()

    await page.waitForURL('/clubs')
    await expect(page).toHaveURL('/clubs')
  })

  test('muestra el detalle del club al hacer click en la fila', async ({
    page
  }) => {
    await setScenario('clubs_con_datos')
    await login(page)
    await page.goto('/clubs')

    await page.getByText('Club Defensores del Norte').click()

    await page.waitForURL(/\/clubs\/detalle\/\d+/)
    await expect(page.getByText('Club Defensores del Norte')).toBeVisible()
    await expect(page.getByText('Descubierta')).toBeVisible()
  })

  test('navega a editar club y guarda los cambios', async ({ page }) => {
    await setScenario('clubs_con_datos')
    await login(page)
    await page.goto('/clubs/editar/1')

    // Esperar que el formulario cargue con los datos del club
    await expect(page.getByLabel('Nombre')).toHaveValue(
      'Club Defensores del Norte'
    )
    await expect(
      page.getByRole('button', { name: 'Descubierta', exact: true })
    ).toBeVisible()

    // Modificar el nombre
    await page.getByLabel('Nombre').fill('Club Defensores Editado')
    await page.getByRole('button', { name: 'Guardar' }).click()

    await page.waitForURL(/\/clubs\/detalle\/1/)
    await expect(page).toHaveURL('/clubs/detalle/1')
  })
})

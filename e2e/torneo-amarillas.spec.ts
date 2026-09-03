import { expect, test } from '@playwright/test'
import { login, setScenario } from './helpers'

test.describe('Torneo — limpiar tarjetas amarillas (Futsal)', () => {
  test.afterEach(async () => {
    await setScenario('happy')
  })

  test('torneo Futsal: el admin abre la pantalla desde la botonera y borra las amarillas', async ({
    page
  }) => {
    await setScenario('torneo_futsal_amarillas')
    await login(page)
    await page.goto('/torneos/detalle/1')

    const botonAmarillas = page.locator(
      'button[aria-label="Limpiar tarjetas amarillas"]'
    )
    await expect(botonAmarillas).toHaveCount(1)
    await botonAmarillas.click()

    await page.waitForURL('**/torneos/detalle/1/amarillas')
    const botonBorrar = page.getByRole('button', {
      name: 'Borrar todas las amarillas de este torneo'
    })
    await expect(botonBorrar).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Club Futsal' })).toBeVisible()
    await expect(page.getByText('Los Amarillos')).toBeVisible()
    await expect(page.getByText('Ana Zapata')).toBeVisible()
    await expect(page.getByText('Caro Diaz')).toBeVisible()

    await botonBorrar.click()

    await expect(
      page.getByText(
        'Se pondrán en cero las tarjetas amarillas de 2 jugadores de este torneo.'
      )
    ).toBeVisible()

    const [request] = await Promise.all([
      page.waitForRequest(
        (req) =>
          req.method() === 'POST' &&
          /\/api\/Torneo\/1\/limpiar-amarillas$/.test(req.url())
      ),
      page.getByRole('button', { name: 'Borrar amarillas' }).click()
    ])
    expect(request).toBeTruthy()

    await expect(
      page.getByText('Se pusieron en cero las tarjetas amarillas del torneo')
    ).toBeVisible()
  })

  test('torneo que no es Futsal: no aparece el botón de limpiar amarillas', async ({
    page
  }) => {
    await setScenario('torneo_detalle')
    await login(page)
    await page.goto('/torneos/detalle/1')

    await expect(
      page.locator('button[aria-label="Limpiar tarjetas amarillas"]')
    ).toHaveCount(0)
  })

  test('sin jugadores con amarillas: mensaje vacío y botón deshabilitado', async ({
    page
  }) => {
    await setScenario('torneo_futsal_amarillas_vacio')
    await login(page)
    await page.goto('/torneos/detalle/1/amarillas')

    await expect(
      page.getByText('No hay jugadores con tarjetas amarillas en este torneo.')
    ).toBeVisible()
    await expect(
      page.getByRole('button', {
        name: 'Borrar todas las amarillas de este torneo'
      })
    ).toBeDisabled()
  })
})

import { expect, test } from '@playwright/test'
import {
  TESTID,
  TEST_IMAGE_BASE64,
  mockearEndpointElDniEstaFichado,
  mockearEndpointObtenerEquipoConEquipoDePrueba,
  mockearEndpointObtenerEquipoConEquipoInvalido,
  mockearFicharJugador,
  setupImageUploader
} from './utils/fichaje-utils'

// Extender el tipo Window para incluir cargarImagen
declare global {
  interface Window {
    cargarImagen: (selector: string, dataUrl: string) => boolean
  }
}

test.describe('Formulario de Fichaje', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/fichaje')
    await page.waitForLoadState('networkidle')
    await setupImageUploader(page)
  })

  test('código equipo incorrecto -> muestra error', async ({ page }) => {
    const mockPromise = page.waitForResponse(
      '**/api/publico/obtener-nombre-equipo**'
    )
    await mockearEndpointObtenerEquipoConEquipoInvalido(page)

    await page.fill(TESTID.INPUTS.CODIGO_EQUIPO, 'CODIGO')
    await page.click(TESTID.BOTONES.VALIDAR_CODIGO)

    await mockPromise

    await expect(page.getByText('El código es incorrecto')).toBeVisible()
  })

  test('código equipo correcto -> muestra su nombre', async ({ page }) => {
    await mockearEndpointObtenerEquipoConEquipoDePrueba(page)
    await page.fill(TESTID.INPUTS.CODIGO_EQUIPO, 'CODIGO123')
    await page.click(TESTID.BOTONES.VALIDAR_CODIGO)

    await expect(page.getByText('Tu equipo es: Equipo de Prueba')).toBeVisible()
  })

  test('DNI ya está fichado -> muestra error', async ({ page }) => {
    await mockearEndpointElDniEstaFichado(page, true)

    await page.fill(TESTID.INPUTS.DNI, '12345678')
    await page.getByTestId('input-dni').blur()

    await expect(
      page.getByText('¡Ups! Ya estás fichado. Consultá con tu delegado.')
    ).toBeVisible()
  })

  test('Servidor devuelve 200 -> redirige a fichaje-exitoso', async ({
    page
  }) => {
    await mockearEndpointElDniEstaFichado(page, false)
    await mockearEndpointObtenerEquipoConEquipoDePrueba(page)
    await mockearFicharJugador(page, 200)

    await page.fill(TESTID.INPUTS.CODIGO_EQUIPO, 'CODIGO123')
    await page.click(TESTID.BOTONES.VALIDAR_CODIGO)
    await expect(page.getByText('Tu equipo es: Equipo de Prueba')).toBeVisible()

    await page.fill(TESTID.INPUTS.NOMBRE, 'Juan')
    await page.fill(TESTID.INPUTS.APELLIDO, 'Pérez')
    await page.fill(TESTID.INPUTS.DNI, '12345678')

    await page.fill(TESTID.INPUTS.DIA, '01')
    await page.fill(TESTID.INPUTS.MES, '01')
    await page.fill(TESTID.INPUTS.ANIO, '1990')

    await page.evaluate(
      ([selector, dataUrl]) => window.cargarImagen(selector, dataUrl),
      [TESTID.INPUTS.FOTO_CARNET, TEST_IMAGE_BASE64]
    )

    await page.waitForSelector('button:has-text("ACEPTAR")', { timeout: 5000 })
    await page.click('button:has-text("ACEPTAR")')

    await page.waitForTimeout(500)

    await page.evaluate(
      ([selector, dataUrl]) => window.cargarImagen(selector, dataUrl),
      [TESTID.INPUTS.FOTO_DNI_FRENTE, TEST_IMAGE_BASE64]
    )

    await page.waitForTimeout(500)

    await page.evaluate(
      ([selector, dataUrl]) => window.cargarImagen(selector, dataUrl),
      [TESTID.INPUTS.FOTO_DNI_DORSO, TEST_IMAGE_BASE64]
    )

    await page.waitForTimeout(500)

    await page.click(TESTID.BOTONES.ENVIAR_DATOS)

    await expect(page).toHaveURL(/fichaje-exitoso/)
    await expect(
      page.getByText(
        '¡Jugador de DNI: 12345678 registrado correctamente! Gracias por ficharte.'
      )
    ).toBeVisible()
  })

  test('Servidor devuelve 500 -> redirige a fichaje-error', async ({
    page
  }) => {
    await mockearEndpointElDniEstaFichado(page, false)
    await mockearEndpointObtenerEquipoConEquipoDePrueba(page)
    await mockearFicharJugador(page, 500)

    const mockPromise = page.waitForResponse('**/api/Jugador')

    await page.fill(TESTID.INPUTS.CODIGO_EQUIPO, 'CODIGO123')
    await page.click(TESTID.BOTONES.VALIDAR_CODIGO)
    await expect(page.getByText('Tu equipo es: Equipo de Prueba')).toBeVisible()

    await page.fill(TESTID.INPUTS.NOMBRE, 'Juan')
    await page.fill(TESTID.INPUTS.APELLIDO, 'Pérez')
    await page.fill(TESTID.INPUTS.DNI, '12345678')

    await page.fill(TESTID.INPUTS.DIA, '01')
    await page.fill(TESTID.INPUTS.MES, '01')
    await page.fill(TESTID.INPUTS.ANIO, '1990')

    await page.evaluate(
      ([selector, dataUrl]) => window.cargarImagen(selector, dataUrl),
      [TESTID.INPUTS.FOTO_CARNET, TEST_IMAGE_BASE64]
    )

    await page.waitForSelector('button:has-text("ACEPTAR")', { timeout: 5000 })
    await page.click('button:has-text("ACEPTAR")')

    await page.waitForTimeout(500)

    await page.evaluate(
      ([selector, dataUrl]) => window.cargarImagen(selector, dataUrl),
      [TESTID.INPUTS.FOTO_DNI_FRENTE, TEST_IMAGE_BASE64]
    )

    await page.waitForTimeout(500)

    await page.evaluate(
      ([selector, dataUrl]) => window.cargarImagen(selector, dataUrl),
      [TESTID.INPUTS.FOTO_DNI_DORSO, TEST_IMAGE_BASE64]
    )

    await page.waitForTimeout(500)

    await page.click(TESTID.BOTONES.ENVIAR_DATOS)

    await mockPromise

    await expect(page).toHaveURL(/fichaje-error/)
    await expect(
      page.getByText('¡Ups! Hubo un error. No se pudo fichar al jugador.')
    ).toBeVisible()
  })
})

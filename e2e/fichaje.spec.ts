import { expect, test } from '@playwright/test'

test.describe('Formulario de Fichaje', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/fichaje')

    await page.waitForLoadState('networkidle')
  })

  test('código equipo incorrecto -> muestra error', async ({ page }) => {
    const mockPromise = page.waitForResponse(
      '**/api/publico/obtener-nombre-equipo**'
    )
    await mockearEndpointObtenerEquipoConEquipoInvalido(page)

    await page.fill('[data-testid="input-codigo-equipo"]', 'CODIGO')
    await page.click('[data-testid="boton-validar-codigo"]')

    await mockPromise

    await expect(page.getByText('El código es incorrecto')).toBeVisible()
  })

  test('código equipo correcto -> muestra su nombre', async ({ page }) => {
    await mockearEndpointObtenerEquipoConEquipoDePrueba(page)
    await page.fill('[data-testid="input-codigo-equipo"]', 'CODIGO123')
    await page.click('[data-testid="boton-validar-codigo"]')

    await expect(page.getByText('Tu equipo es: Equipo de Prueba')).toBeVisible()
  })

  test('DNI ya está fichado -> muestra error', async ({ page }) => {
    await mockearEndpointElDniEstaFichado(page, true)

    await page.fill('[data-testid="input-dni"]', '12345678')
    await page.getByTestId('input-dni').blur()

    await expect(
      page.getByText('¡Ups! Ya estás fichado. Consultá con tu delegado.')
    ).toBeVisible()
  })

  test.skip('completa el formulario exitosamente', async ({ page }) => {
    await mockearEndpointElDniEstaFichado(page, false)
    await mockearEndpointObtenerEquipoConEquipoDePrueba(page)
    await mockearFicharJugador(page, 200)

    await page.fill('[data-testid="input-codigo-equipo"]', 'CODIGO123')
    await page.click('[data-testid="boton-validar-codigo"]')
    await expect(page.getByText('Tu equipo es: Equipo de Prueba')).toBeVisible()

    await page.fill('[data-testid="input-nombre"]', 'Juan')
    await page.fill('[data-testid="input-apellido"]', 'Pérez')
    await page.fill('[data-testid="input-dni"]', '12345678')

    await page.fill('[data-testid="input-dia"]', '01')
    await page.fill('[data-testid="input-mes"]', '01')
    await page.fill('[data-testid="input-anio"]', '1990')

    // Faltan las imágenes

    await page.click('[data-testid="boton-enviar-datos"]')

    await expect(page).toHaveURL(/fichaje-exitoso/)
    await expect(page.getByText(/registrado correctamente/)).toBeVisible()
  })

  test.skip('muestra error del servidor al enviar el formulario', async ({
    page
  }) => {
    await mockearEndpointElDniEstaFichado(page, false)
    await mockearEndpointObtenerEquipoConEquipoDePrueba(page)
    await mockearFicharJugador(page, 500)

    await page.fill('[data-testid="input-codigo-equipo"]', 'CODIGO123')
    await page.click('[data-testid="boton-validar-codigo"]')
    await expect(page.getByText('Tu equipo es: Equipo de Prueba')).toBeVisible()

    await page.fill('[data-testid="input-nombre"]', 'Juan')
    await page.fill('[data-testid="input-apellido"]', 'Pérez')
    await page.fill('[data-testid="input-dni"]', '12345678')

    await page.fill('[data-testid="input-dia"]', '01')
    await page.fill('[data-testid="input-mes"]', '01')
    await page.fill('[data-testid="input-anio"]', '1990')

    // Faltan las imágenes

    await page.click('[data-testid="boton-enviar-datos"]')

    await expect(page).toHaveURL(/fichaje-error/)
    await expect(page.getByText('Error al procesar la solicitud')).toBeVisible()
  })
})
async function mockearFicharJugador(page, status: number) {
  await page.route('**/api/Jugador', async (route) => {
    await route.fulfill({ status: status })
  })
}

async function mockearEndpointObtenerEquipoConEquipoDePrueba(page) {
  await page.route('**/api/publico/obtener-nombre-equipo**', async (route) => {
    await route.fulfill({
      json: {
        hayError: false,
        mensajeError: null,
        respuesta: 'Equipo de Prueba'
      }
    })
  })
}

async function mockearEndpointObtenerEquipoConEquipoInvalido(page) {
  await page.route('**/api/publico/obtener-nombre-equipo**', async (route) => {
    await route.fulfill({
      json: {
        hayError: true,
        mensajeError: 'El código es incorrecto',
        respuesta: null
      }
    })
  })
}

async function mockearEndpointElDniEstaFichado(page, valor: boolean) {
  await page.route('**/api/publico/el-dni-esta-fichado**', async (route) => {
    await route.fulfill({ json: valor })
  })
}

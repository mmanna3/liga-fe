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

  test('muestra error del servidor al enviar el formulario', async ({
    page
  }) => {
    await mockearEndpointElDniEstaFichado(page, false)
    await mockearEndpointObtenerEquipoConEquipoDePrueba(page)
    await mockearFicharJugador(page, 500)

    const mockPromise = page.waitForResponse('**/api/Jugador')

    await page.fill('[data-testid="input-codigo-equipo"]', 'CODIGO123')
    await page.click('[data-testid="boton-validar-codigo"]')
    await expect(page.getByText('Tu equipo es: Equipo de Prueba')).toBeVisible()

    await page.fill('[data-testid="input-nombre"]', 'Juan')
    await page.fill('[data-testid="input-apellido"]', 'Pérez')
    await page.fill('[data-testid="input-dni"]', '12345678')

    await page.fill('[data-testid="input-dia"]', '01')
    await page.fill('[data-testid="input-mes"]', '01')
    await page.fill('[data-testid="input-anio"]', '1990')

    // Usar evaluate para encontrar y disparar eventos de carga de archivos
    await page.evaluate(() => {
      // Función para crear y disparar un evento de cambio de archivo
      const simulateFileUpload = (selector, dataUrl) => {
        const input = document.querySelector(selector)
        if (!input) return false

        // Crear un objeto File
        const byteString = atob(dataUrl.split(',')[1])
        const ab = new ArrayBuffer(byteString.length)
        const ia = new Uint8Array(ab)
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i)
        }
        const blob = new Blob([ab], { type: 'image/png' })
        const file = new File([blob], 'image.png', { type: 'image/png' })

        // Crear y disparar el evento
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        input.files = dataTransfer.files

        // Disparar evento change
        input.dispatchEvent(new Event('change', { bubbles: true }))
        return true
      }

      // Simulamos la carga para cada input de archivo
      const dataUrl =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

      simulateFileUpload('[data-testid="input-foto-carnet"]', dataUrl)
      simulateFileUpload('[data-testid="input-fotoDNIFrente"]', dataUrl)
      simulateFileUpload('[data-testid="input-fotoDNIDorso"]', dataUrl)
    })

    // Esperar a que aparezca el cropper y hacer clic en Aceptar
    await page.waitForSelector('button:has-text("ACEPTAR")', { timeout: 5000 })
    await page.click('button:has-text("ACEPTAR")')

    // Esperamos a que se procesen las imágenes
    await page.waitForTimeout(500)

    await page.click('[data-testid="boton-enviar-datos"]')

    await mockPromise

    await expect(page).toHaveURL(/fichaje-error/)
    await expect(
      page.getByText('¡Ups! Hubo un error. No se pudo fichar al jugador.')
    ).toBeVisible()
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

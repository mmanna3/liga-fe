import { Page } from '@playwright/test'

// Constantes para test IDs
export const TESTID = {
  INPUTS: {
    CODIGO_EQUIPO: '[data-testid="input-codigo-equipo"]',
    NOMBRE: '[data-testid="input-nombre"]',
    APELLIDO: '[data-testid="input-apellido"]',
    DNI: '[data-testid="input-dni"]',
    DIA: '[data-testid="input-dia"]',
    MES: '[data-testid="input-mes"]',
    ANIO: '[data-testid="input-anio"]',
    FOTO_CARNET: '[data-testid="input-foto-carnet"]',
    FOTO_DNI_FRENTE: '[data-testid="input-fotoDNIFrente"]',
    FOTO_DNI_DORSO: '[data-testid="input-fotoDNIDorso"]'
  },
  BOTONES: {
    VALIDAR_CODIGO: '[data-testid="boton-validar-codigo"]',
    ENVIAR_DATOS: '[data-testid="boton-enviar-datos"]'
  }
}

// Imagen de prueba para los tests
export const TEST_IMAGE_BASE64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

// Funciones de mock para los endpoints
export async function mockearFicharJugador(page: Page, status: number) {
  await page.route('**/api/Jugador', async (route) => {
    await route.fulfill({ status: status })
  })
}

export async function mockearEndpointObtenerEquipoConEquipoDePrueba(
  page: Page
) {
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

export async function mockearEndpointObtenerEquipoConEquipoInvalido(
  page: Page
) {
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

export async function mockearEndpointElDniEstaFichado(
  page: Page,
  valor: boolean
) {
  await page.route('**/api/publico/el-dni-esta-fichado**', async (route) => {
    await route.fulfill({ json: valor })
  })
}

// Configuración de la función cargarImagen en el navegador
export async function setupImageUploader(page: Page) {
  await page.addScriptTag({
    content: `
      window.cargarImagen = function(selector, dataUrl) {
        const input = document.querySelector(selector);
        if (!input) return false;

        const byteString = atob(dataUrl.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: 'image/png' });
        const file = new File([blob], 'image.png', { type: 'image/png' });

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;

        input.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
    `
  })
}

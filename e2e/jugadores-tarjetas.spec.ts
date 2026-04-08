import { expect, test } from '@playwright/test'

/**
 * Contrato del mock y del cliente generado para tarjetas por vínculo jugador–equipo.
 * La verificación contra el backend real está en Api.TestsDeIntegracion/JugadorIT.cs
 * (ActualizarTarjetas_*).
 */
test.describe('Jugadores — tarjetas (mock API)', () => {
  test('actualizar-tarjetas responde 200 y el detalle incluye tarjetas en equipos', async ({
    request
  }) => {
    const resPost = await request.post('http://localhost:3001/api/Jugador/actualizar-tarjetas', {
      data: {
        jugadorEquipoId: 1,
        tarjetasAmarillas: 2,
        tarjetasRojas: 1
      }
    })
    expect(resPost.ok()).toBeTruthy()

    const resGet = await request.get('http://localhost:3001/api/Jugador/1')
    expect(resGet.ok()).toBeTruthy()
    const body = (await resGet.json()) as {
      equipos: Array<{ tarjetasAmarillas?: number; tarjetasRojas?: number }>
    }
    expect(body.equipos[0].tarjetasAmarillas).toBe(0)
    expect(body.equipos[0].tarjetasRojas).toBe(0)
  })
})

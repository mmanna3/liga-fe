import { describe, expect, it } from 'vitest'
import { ordenarFixtureAlgoritmoFechas } from './fixture-algoritmo-fechas'

describe('ordenarFixtureAlgoritmoFechas', () => {
  it('ordena por fecha y luego por orden dentro de la misma fecha', () => {
    const fechas = [
      { fecha: 2, orden: 1, equipoLocal: 4, equipoVisitante: 1 },
      { fecha: 1, orden: 2, equipoLocal: 1, equipoVisitante: 2 },
      { fecha: 1, orden: 1, equipoLocal: 3, equipoVisitante: 4 }
    ]

    expect(ordenarFixtureAlgoritmoFechas(fechas)).toEqual([
      { fecha: 1, orden: 1, equipoLocal: 3, equipoVisitante: 4 },
      { fecha: 1, orden: 2, equipoLocal: 1, equipoVisitante: 2 },
      { fecha: 2, orden: 1, equipoLocal: 4, equipoVisitante: 1 }
    ])
  })
})

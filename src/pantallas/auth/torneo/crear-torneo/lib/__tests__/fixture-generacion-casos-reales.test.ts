import { describe, expect, it } from 'vitest'
import {
  calcularEstadisticasFixture,
  generarFixture
} from '../fixture-generacion'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const todasLasExcepciones = (stats: {
  excepciones: {
    encuentros: string[]
    localVisitante: string[]
    jornadasLibres: string[]
    jornadasInterzonales: string[]
  }
}) => [
  ...stats.excepciones.encuentros,
  ...stats.excepciones.localVisitante,
  ...stats.excepciones.jornadasLibres,
  ...stats.excepciones.jornadasInterzonales
]

const equipos = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `E${i + 1}` }))

const contarPorEquipo = (
  fixture: ReturnType<typeof generarFixture>,
  tipo: 'regular' | 'libre' | 'interzonal'
) => {
  const conteo: Record<number, number> = {}
  for (const fecha of fixture) {
    for (const entrada of fecha.entradas) {
      if (entrada.tipo === tipo) {
        if (entrada.idEquipoLocal != null)
          conteo[entrada.idEquipoLocal] =
            (conteo[entrada.idEquipoLocal] ?? 0) + 1
        if (entrada.idEquipoVisitante != null)
          conteo[entrada.idEquipoVisitante] =
            (conteo[entrada.idEquipoVisitante] ?? 0) + 1
      }
    }
  }
  return conteo
}

// ─── Caso: 14 equipos, sin libre ni interzonal ───────────────────────────────
// T=14, fechas=13. Cada equipo juega 13 regulares (N-1=13 impar: 6 o 7 de local).

describe('14 equipos, sin libre ni interzonal', () => {
  const eq = equipos(14)
  const fechas = generarFixture(eq, 0, 0, 'ida')
  const stats = calcularEstadisticasFixture(fechas, eq, 0, 0, 'ida')

  it('genera 13 fechas', () => {
    expect(fechas).toHaveLength(13)
  })

  it('cada equipo juega exactamente 13 partidos regulares', () => {
    const conteo = contarPorEquipo(fechas, 'regular')
    for (const e of eq) expect(conteo[e.id]).toBe(13)
  })

  it('ningún equipo queda libre ni juega interzonal', () => {
    const libres = contarPorEquipo(fechas, 'libre')
    const interzonales = contarPorEquipo(fechas, 'interzonal')
    for (const e of eq) {
      expect(libres[e.id] ?? 0).toBe(0)
      expect(interzonales[e.id] ?? 0).toBe(0)
    }
  })

  it('sin excepciones (6 o 7 de local ambos son válidos para N-1=13 impar)', () => {
    expect(todasLasExcepciones(stats)).toHaveLength(0)
  })

  it('partidosLocalEsperados=6, partidosVisitanteEsperados=7', () => {
    expect(stats.partidosLocalEsperados).toBe(6)
    expect(stats.partidosVisitanteEsperados).toBe(7)
  })
})

// ─── Caso: 13 equipos + 1 libre, sin interzonal ──────────────────────────────
// T=14, fechas=13. Cada equipo juega 12 regulares + 1 libre (N-1=12 par: 6/6).

describe('13 equipos + 1 libre, sin interzonal', () => {
  const eq = equipos(13)
  const fechas = generarFixture(eq, 1, 0, 'ida')
  const stats = calcularEstadisticasFixture(fechas, eq, 1, 0, 'ida')

  it('genera 13 fechas', () => {
    expect(fechas).toHaveLength(13)
  })

  it('cada equipo juega exactamente 12 partidos regulares', () => {
    const conteo = contarPorEquipo(fechas, 'regular')
    for (const e of eq) expect(conteo[e.id]).toBe(12)
  })

  it('cada equipo queda libre exactamente 1 fecha', () => {
    const conteo = contarPorEquipo(fechas, 'libre')
    for (const e of eq) expect(conteo[e.id]).toBe(1)
  })

  it('ningún equipo juega interzonal', () => {
    const conteo = contarPorEquipo(fechas, 'interzonal')
    for (const e of eq) expect(conteo[e.id] ?? 0).toBe(0)
  })

  it('sin excepciones (12 regulares, N-1=12 par → 6/6 local/visitante)', () => {
    expect(todasLasExcepciones(stats)).toHaveLength(0)
  })

  it('partidosLocalEsperados = partidosVisitanteEsperados = 6', () => {
    expect(stats.partidosLocalEsperados).toBe(6)
    expect(stats.partidosVisitanteEsperados).toBe(6)
  })
})

// ─── Caso: 13 equipos + 1 interzonal, sin libre ──────────────────────────────
// T=14, fechas=13. Cada equipo juega 12 regulares + 1 interzonal (N-1=12 par: 6/6).

describe('13 equipos + 1 interzonal, sin libre', () => {
  const eq = equipos(13)
  const fechas = generarFixture(eq, 0, 1, 'ida')
  const stats = calcularEstadisticasFixture(fechas, eq, 0, 1, 'ida')

  it('genera 13 fechas', () => {
    expect(fechas).toHaveLength(13)
  })

  it('cada equipo juega exactamente 12 partidos regulares', () => {
    const conteo = contarPorEquipo(fechas, 'regular')
    for (const e of eq) expect(conteo[e.id]).toBe(12)
  })

  it('cada equipo juega exactamente 1 fecha interzonal', () => {
    const conteo = contarPorEquipo(fechas, 'interzonal')
    for (const e of eq) expect(conteo[e.id]).toBe(1)
  })

  it('ningún equipo queda libre', () => {
    const conteo = contarPorEquipo(fechas, 'libre')
    for (const e of eq) expect(conteo[e.id] ?? 0).toBe(0)
  })

  it('sin excepciones', () => {
    expect(todasLasExcepciones(stats)).toHaveLength(0)
  })
})

// ─── Caso: 12 equipos + 1 libre + 1 interzonal ───────────────────────────────
// T=14, fechas=13. Cada equipo juega 11 regulares + 1 libre + 1 interzonal
// (N-1=11 impar: 5 o 6 de local).

describe('12 equipos + 1 libre + 1 interzonal', () => {
  const eq = equipos(12)
  const fechas = generarFixture(eq, 1, 1, 'ida')
  const stats = calcularEstadisticasFixture(fechas, eq, 1, 1, 'ida')

  it('genera 13 fechas', () => {
    expect(fechas).toHaveLength(13)
  })

  it('cada equipo juega exactamente 11 partidos regulares', () => {
    const conteo = contarPorEquipo(fechas, 'regular')
    for (const e of eq) expect(conteo[e.id]).toBe(11)
  })

  it('cada equipo queda libre exactamente 1 fecha', () => {
    const conteo = contarPorEquipo(fechas, 'libre')
    for (const e of eq) expect(conteo[e.id]).toBe(1)
  })

  it('cada equipo juega exactamente 1 fecha interzonal', () => {
    const conteo = contarPorEquipo(fechas, 'interzonal')
    for (const e of eq) expect(conteo[e.id]).toBe(1)
  })

  it('sin excepciones (5 o 6 de local son válidos para N-1=11 impar)', () => {
    expect(todasLasExcepciones(stats)).toHaveLength(0)
  })

  it('partidosLocalEsperados=5, partidosVisitanteEsperados=6', () => {
    expect(stats.partidosLocalEsperados).toBe(5)
    expect(stats.partidosVisitanteEsperados).toBe(6)
  })
})

// ─── Caso: 10 equipos, sin libre ni interzonal ───────────────────────────────
// T=10, fechas=9. Cada equipo juega 9 regulares (N-1=9 impar: 4 o 5 de local).

describe('10 equipos, sin libre ni interzonal', () => {
  const eq = equipos(10)
  const fechas = generarFixture(eq, 0, 0, 'ida')
  const stats = calcularEstadisticasFixture(fechas, eq, 0, 0, 'ida')

  it('genera 9 fechas', () => {
    expect(fechas).toHaveLength(9)
  })

  it('cada equipo juega exactamente 9 partidos regulares', () => {
    const conteo = contarPorEquipo(fechas, 'regular')
    for (const e of eq) expect(conteo[e.id]).toBe(9)
  })

  it('ningún equipo queda libre ni juega interzonal', () => {
    const libres = contarPorEquipo(fechas, 'libre')
    const interzonales = contarPorEquipo(fechas, 'interzonal')
    for (const e of eq) {
      expect(libres[e.id] ?? 0).toBe(0)
      expect(interzonales[e.id] ?? 0).toBe(0)
    }
  })

  it('sin excepciones (4 o 5 de local son válidos para N-1=9 impar)', () => {
    expect(todasLasExcepciones(stats)).toHaveLength(0)
  })

  it('partidosLocalEsperados=4, partidosVisitanteEsperados=5', () => {
    expect(stats.partidosLocalEsperados).toBe(4)
    expect(stats.partidosVisitanteEsperados).toBe(5)
  })
})

// ─── Caso: 9 equipos + 1 libre, sin interzonal ───────────────────────────────
// T=10, fechas=9. Cada equipo juega 8 regulares + 1 libre (N-1=8 par: 4/4).

describe('9 equipos + 1 libre, sin interzonal', () => {
  const eq = equipos(9)
  const fechas = generarFixture(eq, 1, 0, 'ida')
  const stats = calcularEstadisticasFixture(fechas, eq, 1, 0, 'ida')

  it('genera 9 fechas', () => {
    expect(fechas).toHaveLength(9)
  })

  it('cada equipo juega exactamente 8 partidos regulares', () => {
    const conteo = contarPorEquipo(fechas, 'regular')
    for (const e of eq) expect(conteo[e.id]).toBe(8)
  })

  it('cada equipo queda libre exactamente 1 fecha', () => {
    const conteo = contarPorEquipo(fechas, 'libre')
    for (const e of eq) expect(conteo[e.id]).toBe(1)
  })

  it('ningún equipo juega interzonal', () => {
    const conteo = contarPorEquipo(fechas, 'interzonal')
    for (const e of eq) expect(conteo[e.id] ?? 0).toBe(0)
  })

  it('sin excepciones (8 regulares, N-1=8 par → 4/4 local/visitante)', () => {
    expect(todasLasExcepciones(stats)).toHaveLength(0)
  })

  it('partidosLocalEsperados = partidosVisitanteEsperados = 4', () => {
    expect(stats.partidosLocalEsperados).toBe(4)
    expect(stats.partidosVisitanteEsperados).toBe(4)
  })
})

// ─── Caso: 9 equipos + 1 interzonal, sin libre ───────────────────────────────
// T=10, fechas=9. Cada equipo juega 8 regulares + 1 interzonal (N-1=8 par: 4/4).

describe('9 equipos + 1 interzonal, sin libre', () => {
  const eq = equipos(9)
  const fechas = generarFixture(eq, 0, 1, 'ida')
  const stats = calcularEstadisticasFixture(fechas, eq, 0, 1, 'ida')

  it('genera 9 fechas', () => {
    expect(fechas).toHaveLength(9)
  })

  it('cada equipo juega exactamente 8 partidos regulares', () => {
    const conteo = contarPorEquipo(fechas, 'regular')
    for (const e of eq) expect(conteo[e.id]).toBe(8)
  })

  it('cada equipo juega exactamente 1 fecha interzonal', () => {
    const conteo = contarPorEquipo(fechas, 'interzonal')
    for (const e of eq) expect(conteo[e.id]).toBe(1)
  })

  it('ningún equipo queda libre', () => {
    const conteo = contarPorEquipo(fechas, 'libre')
    for (const e of eq) expect(conteo[e.id] ?? 0).toBe(0)
  })

  it('sin excepciones', () => {
    expect(todasLasExcepciones(stats)).toHaveLength(0)
  })

  it('partidosLocalEsperados = partidosVisitanteEsperados = 4', () => {
    expect(stats.partidosLocalEsperados).toBe(4)
    expect(stats.partidosVisitanteEsperados).toBe(4)
  })
})

// ─── Caso: 8 equipos + 1 libre + 1 interzonal ────────────────────────────────
// T=10, fechas=9. Cada equipo juega 7 regulares + 1 libre + 1 interzonal
// (N-1=7 impar: 3 o 4 de local).

describe('8 equipos + 1 libre + 1 interzonal', () => {
  const eq = equipos(8)
  const fechas = generarFixture(eq, 1, 1, 'ida')
  const stats = calcularEstadisticasFixture(fechas, eq, 1, 1, 'ida')

  it('genera 9 fechas', () => {
    expect(fechas).toHaveLength(9)
  })

  it('cada equipo juega exactamente 7 partidos regulares', () => {
    const conteo = contarPorEquipo(fechas, 'regular')
    for (const e of eq) expect(conteo[e.id]).toBe(7)
  })

  it('cada equipo queda libre exactamente 1 fecha', () => {
    const conteo = contarPorEquipo(fechas, 'libre')
    for (const e of eq) expect(conteo[e.id]).toBe(1)
  })

  it('cada equipo juega exactamente 1 fecha interzonal', () => {
    const conteo = contarPorEquipo(fechas, 'interzonal')
    for (const e of eq) expect(conteo[e.id]).toBe(1)
  })

  it('sin excepciones (3 o 4 de local son válidos para N-1=7 impar)', () => {
    expect(todasLasExcepciones(stats)).toHaveLength(0)
  })

  it('partidosLocalEsperados=3, partidosVisitanteEsperados=4', () => {
    expect(stats.partidosLocalEsperados).toBe(3)
    expect(stats.partidosVisitanteEsperados).toBe(4)
  })
})

// ─── Casos adicionales: otros tamaños comunes ────────────────────────────────

describe('casos adicionales', () => {
  it('2 equipos + 2 libres → 3 fechas, cada equipo juega 1 regular y 2 libres', () => {
    const eq = equipos(2)
    const fechas = generarFixture(eq, 2, 0, 'ida')
    expect(fechas).toHaveLength(3)
    const regular = contarPorEquipo(fechas, 'regular')
    const libre = contarPorEquipo(fechas, 'libre')
    for (const e of eq) {
      expect(regular[e.id]).toBe(1)
      expect(libre[e.id]).toBe(2)
    }
  })

  it('6 equipos + 2 libres → 7 fechas, cada equipo juega 5 regulares y 2 libres', () => {
    const eq = equipos(6)
    const fechas = generarFixture(eq, 2, 0, 'ida')
    expect(fechas).toHaveLength(7)
    const regular = contarPorEquipo(fechas, 'regular')
    const libre = contarPorEquipo(fechas, 'libre')
    for (const e of eq) {
      expect(regular[e.id]).toBe(5)
      expect(libre[e.id]).toBe(2)
    }
  })

  it('6 equipos + 2 interzonales → 7 fechas, cada equipo juega 5 regulares y 2 interzonales', () => {
    const eq = equipos(6)
    const fechas = generarFixture(eq, 0, 2, 'ida')
    expect(fechas).toHaveLength(7)
    const regular = contarPorEquipo(fechas, 'regular')
    const interzonal = contarPorEquipo(fechas, 'interzonal')
    for (const e of eq) {
      expect(regular[e.id]).toBe(5)
      expect(interzonal[e.id]).toBe(2)
    }
  })

  it('11 equipos + 1 libre → 11 fechas, cada equipo juega 10 regulares y 1 libre', () => {
    const eq = equipos(11)
    const fechas = generarFixture(eq, 1, 0, 'ida')
    expect(fechas).toHaveLength(11)
    const regular = contarPorEquipo(fechas, 'regular')
    const libre = contarPorEquipo(fechas, 'libre')
    for (const e of eq) {
      expect(regular[e.id]).toBe(10)
      expect(libre[e.id]).toBe(1)
    }
  })

  it('11 equipos + 1 libre: sin excepciones (N-1=10 par → 5/5 local/visitante)', () => {
    const eq = equipos(11)
    const fechas = generarFixture(eq, 1, 0, 'ida')
    const stats = calcularEstadisticasFixture(fechas, eq, 1, 0, 'ida')
    expect(todasLasExcepciones(stats)).toHaveLength(0)
    expect(stats.partidosLocalEsperados).toBe(5)
    expect(stats.partidosVisitanteEsperados).toBe(5)
  })

  it('7 equipos + 1 libre → 7 fechas, cada equipo juega 6 regulares y 1 libre', () => {
    const eq = equipos(7)
    const fechas = generarFixture(eq, 1, 0, 'ida')
    expect(fechas).toHaveLength(7)
    const regular = contarPorEquipo(fechas, 'regular')
    const libre = contarPorEquipo(fechas, 'libre')
    for (const e of eq) {
      expect(regular[e.id]).toBe(6)
      expect(libre[e.id]).toBe(1)
    }
  })

  it('7 equipos + 1 libre: sin excepciones (N-1=6 par → 3/3 local/visitante)', () => {
    const eq = equipos(7)
    const fechas = generarFixture(eq, 1, 0, 'ida')
    const stats = calcularEstadisticasFixture(fechas, eq, 1, 0, 'ida')
    expect(todasLasExcepciones(stats)).toHaveLength(0)
    expect(stats.partidosLocalEsperados).toBe(3)
    expect(stats.partidosVisitanteEsperados).toBe(3)
  })

  it('cada equipo no aparece más de una vez por fecha en ningún caso', () => {
    const casos = [
      generarFixture(equipos(14), 0, 0, 'ida'),
      generarFixture(equipos(13), 1, 0, 'ida'),
      generarFixture(equipos(9), 1, 0, 'ida'),
      generarFixture(equipos(8), 1, 1, 'ida')
    ]
    for (const fechas of casos) {
      for (const fecha of fechas) {
        const ids: number[] = []
        for (const e of fecha.entradas) {
          if (e.idEquipoLocal != null) ids.push(e.idEquipoLocal)
          if (e.idEquipoVisitante != null) ids.push(e.idEquipoVisitante)
        }
        expect(new Set(ids).size).toBe(ids.length)
      }
    }
  })
})

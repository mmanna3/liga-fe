import { describe, expect, it } from 'vitest'
import {
  calcularEstadisticasFixture,
  fusionarYResolverInterzonal,
  generarFixture,
  generarTodosLosFixtures,
  intercambiarEquiposEnFecha,
  intercambiarParticipantesEnBracket
} from '../fixture-generacion'
import type { EntradaDeZona, FechaFixture } from '../fixture-tipos'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const equipos = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `E${i + 1}` }))

const zonaInput = (
  id: string,
  cantEquipos: number,
  libres = 0,
  interzonales = 0
): EntradaDeZona => ({
  id,
  nombre: `Zona ${id}`,
  equipos: equipos(cantEquipos),
  fechasLibres: libres,
  fechasInterzonales: interzonales
})

// Cuenta cuántas veces juega cada equipo de un tipo dado
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

// ─── generarFixture – validaciones básicas ───────────────────────────────────

describe('generarFixture – estructura', () => {
  it('lanza error si el total de participantes es impar', () => {
    expect(() => generarFixture(equipos(3), 0, 0, 'ida')).toThrow()
  })

  it('retorna vacío si hay menos de 2 participantes', () => {
    expect(generarFixture(equipos(1), 0, 0, 'ida')).toHaveLength(0)
    expect(generarFixture([], 0, 0, 'ida')).toHaveLength(0)
  })

  it('2 equipos, ida → 1 fecha con 1 partido regular', () => {
    const fechas = generarFixture(equipos(2), 0, 0, 'ida')
    expect(fechas).toHaveLength(1)
    expect(fechas[0].entradas).toHaveLength(1)
    expect(fechas[0].entradas[0].tipo).toBe('regular')
  })

  it('4 equipos, ida → 3 fechas con 2 partidos cada una', () => {
    const fechas = generarFixture(equipos(4), 0, 0, 'ida')
    expect(fechas).toHaveLength(3)
    for (const fecha of fechas) {
      expect(fecha.entradas).toHaveLength(2)
    }
  })

  it('4 equipos, ida y vuelta → 6 fechas', () => {
    const fechas = generarFixture(equipos(4), 0, 0, 'ida-y-vuelta')
    expect(fechas).toHaveLength(6)
  })

  it('los números de fecha son consecutivos desde 1', () => {
    const fechas = generarFixture(equipos(4), 0, 0, 'ida')
    expect(fechas.map((f) => f.numeroFecha)).toEqual([1, 2, 3])
  })

  it('todos los IDs de entradas son únicos', () => {
    const fechas = generarFixture(equipos(6), 0, 0, 'ida')
    const ids = fechas.flatMap((f) => f.entradas.map((e) => e.id))
    expect(new Set(ids).size).toBe(ids.length)
  })
})

// ─── generarFixture – invariantes de distribución ────────────────────────────

describe('generarFixture – distribución de partidos', () => {
  it('4 equipos, ida: cada equipo juega exactamente 3 partidos regulares', () => {
    const eq = equipos(4)
    const fechas = generarFixture(eq, 0, 0, 'ida')
    const conteo = contarPorEquipo(fechas, 'regular')
    for (const e of eq) {
      expect(conteo[e.id]).toBe(3)
    }
  })

  it('6 equipos, ida: cada equipo juega exactamente 5 partidos regulares', () => {
    const eq = equipos(6)
    const fechas = generarFixture(eq, 0, 0, 'ida')
    const conteo = contarPorEquipo(fechas, 'regular')
    for (const e of eq) {
      expect(conteo[e.id]).toBe(5)
    }
  })

  it('4 equipos, ida y vuelta: cada equipo juega 6 partidos regulares', () => {
    const eq = equipos(4)
    const fechas = generarFixture(eq, 0, 0, 'ida-y-vuelta')
    const conteo = contarPorEquipo(fechas, 'regular')
    for (const e of eq) {
      expect(conteo[e.id]).toBe(6)
    }
  })

  it('4 equipos, ida y vuelta: cada equipo juega 3 de local y 3 de visitante', () => {
    const eq = equipos(4)
    const fechas = generarFixture(eq, 0, 0, 'ida-y-vuelta')
    for (const e of eq) {
      const local = fechas.flatMap((f) =>
        f.entradas.filter(
          (en) => en.tipo === 'regular' && en.idEquipoLocal === e.id
        )
      ).length
      const visitante = fechas.flatMap((f) =>
        f.entradas.filter(
          (en) => en.tipo === 'regular' && en.idEquipoVisitante === e.id
        )
      ).length
      expect(local).toBe(3)
      expect(visitante).toBe(3)
    }
  })

  it('ningún equipo se enfrenta a sí mismo', () => {
    const fechas = generarFixture(equipos(6), 0, 0, 'ida')
    for (const fecha of fechas) {
      for (const entrada of fecha.entradas) {
        if (entrada.tipo === 'regular') {
          expect(entrada.idEquipoLocal).not.toBe(entrada.idEquipoVisitante)
        }
      }
    }
  })

  it('en modo ida, cada equipo no aparece más de una vez por fecha', () => {
    const fechas = generarFixture(equipos(6), 0, 0, 'ida')
    for (const fecha of fechas) {
      const idsEnFecha: number[] = []
      for (const entrada of fecha.entradas) {
        if (entrada.idEquipoLocal != null)
          idsEnFecha.push(entrada.idEquipoLocal)
        if (entrada.idEquipoVisitante != null)
          idsEnFecha.push(entrada.idEquipoVisitante)
      }
      // Filtrar nulls (fantasmas) y verificar unicidad de ids reales
      const soloReales = idsEnFecha.filter((id) => id > 0)
      expect(new Set(soloReales).size).toBe(soloReales.length)
    }
  })
})

// ─── generarFixture – fechas libres ──────────────────────────────────────────

describe('generarFixture – fechas libres', () => {
  it('3 equipos + 1 libre: cada equipo descansa exactamente 1 fecha', () => {
    // T = 3 + 1 = 4 (par) → válido
    const eq = equipos(3)
    const fechas = generarFixture(eq, 1, 0, 'ida')
    const conteo = contarPorEquipo(fechas, 'libre')
    for (const e of eq) {
      expect(conteo[e.id]).toBe(1)
    }
  })

  it('6 equipos + 2 libres: cada equipo descansa exactamente 2 fechas', () => {
    // T = 6 + 2 = 8 (par) → válido
    const eq = equipos(6)
    const fechas = generarFixture(eq, 2, 0, 'ida')
    const conteo = contarPorEquipo(fechas, 'libre')
    for (const e of eq) {
      expect(conteo[e.id]).toBe(2)
    }
  })

  it('entradas tipo libre tienen idEquipoVisitante null y texto LIBRE', () => {
    // T = 3 + 1 = 4 (par)
    const fechas = generarFixture(equipos(3), 1, 0, 'ida')
    const libres = fechas.flatMap((f) =>
      f.entradas.filter((e) => e.tipo === 'libre')
    )
    expect(libres.length).toBeGreaterThan(0)
    for (const libre of libres) {
      expect(libre.idEquipoVisitante).toBeNull()
      expect(libre.visitante).toBe('LIBRE')
    }
  })
})

// ─── generarFixture – fechas interzonales ────────────────────────────────────

describe('generarFixture – fechas interzonales', () => {
  it('4 equipos + 2 interzonales: cada equipo juega exactamente 2 fechas interzonales', () => {
    const eq = equipos(4)
    const fechas = generarFixture(eq, 0, 2, 'ida')
    const conteo = contarPorEquipo(fechas, 'interzonal')
    for (const e of eq) {
      expect(conteo[e.id]).toBe(2)
    }
  })

  it('entradas tipo interzonal tienen exactamente un idEquipo null (INTERZONAL fantasma)', () => {
    const fechas = generarFixture(equipos(4), 0, 2, 'ida')
    const interzonales = fechas.flatMap((f) =>
      f.entradas.filter((e) => e.tipo === 'interzonal')
    )
    for (const iz of interzonales) {
      const nulls = [iz.idEquipoLocal, iz.idEquipoVisitante].filter(
        (id) => id === null
      ).length
      expect(nulls).toBe(1)
    }
  })
})

// ─── generarFixture – totales de fechas correctos ────────────────────────────

describe('generarFixture – cantidad de fechas', () => {
  it.each([
    [4, 0, 0, 'ida', 3],
    [4, 0, 0, 'ida-y-vuelta', 6],
    [3, 1, 0, 'ida', 3],
    [6, 0, 0, 'ida', 5],
    [4, 0, 2, 'ida', 5] // T = 4+2 = 6 → 5 fechas
  ] as const)(
    '%i equipos + %i libres + %i interzonales (%s) → %i fechas',
    (cant, libres, iz, vuelta, fechasEsperadas) => {
      const fechas = generarFixture(equipos(cant), libres, iz, vuelta)
      expect(fechas).toHaveLength(fechasEsperadas)
    }
  )
})

// ─── generarTodosLosFixtures ──────────────────────────────────────────────────

describe('generarTodosLosFixtures', () => {
  it('genera un fixture por zona', () => {
    const zonas: EntradaDeZona[] = [zonaInput('A', 4), zonaInput('B', 6)]
    const result = generarTodosLosFixtures(zonas, 'ida')
    expect(result).toHaveLength(2)
    expect(result[0].idZona).toBe('A')
    expect(result[1].idZona).toBe('B')
  })

  it('zona de 4 equipos ida → 3 fechas', () => {
    const result = generarTodosLosFixtures([zonaInput('A', 4)], 'ida')
    expect(result[0].fechas).toHaveLength(3)
  })

  it('incluye estadisticas con 0 excepciones para un fixture correcto', () => {
    const result = generarTodosLosFixtures([zonaInput('A', 4)], 'ida')
    expect(result[0].estadisticas.excepciones).toHaveLength(0)
  })
})

// ─── fusionarYResolverInterzonal ──────────────────────────────────────────────

describe('fusionarYResolverInterzonal', () => {
  it('entrada vacía → retorna vacío', () => {
    expect(fusionarYResolverInterzonal([])).toHaveLength(0)
  })

  it('una sola zona sin interzonales conserva todos los partidos regulares', () => {
    const [fixture] = generarTodosLosFixtures([zonaInput('A', 4)], 'ida')
    const fusionado = fusionarYResolverInterzonal([fixture])
    const totalRegulares = fusionado.flatMap((f) =>
      f.entradas.filter((e) => e.tipo === 'regular')
    ).length
    expect(totalRegulares).toBe(6) // 4 equipos ida → C(4,2) = 6 partidos
  })

  it('dos zonas con interzonales generan partidos con equipos de zonas distintas', () => {
    const zonas: EntradaDeZona[] = [
      zonaInput('A', 4, 0, 2),
      zonaInput('B', 4, 0, 2)
    ]
    const fixtures = generarTodosLosFixtures(zonas, 'ida')
    const fusionado = fusionarYResolverInterzonal(fixtures)

    const idsZonaA = new Set(zonas[0].equipos.map((e) => e.id))
    const idsZonaB = new Set(zonas[1].equipos.map((e) => e.id))

    const interzonales = fusionado.flatMap((f) =>
      f.entradas.filter((e) => e.tipo === 'interzonal')
    )

    expect(interzonales.length).toBeGreaterThan(0)

    for (const iz of interzonales) {
      const localEnA =
        iz.idEquipoLocal != null && idsZonaA.has(iz.idEquipoLocal)
      const localEnB =
        iz.idEquipoLocal != null && idsZonaB.has(iz.idEquipoLocal)
      const visitanteEnA =
        iz.idEquipoVisitante != null && idsZonaA.has(iz.idEquipoVisitante)
      const visitanteEnB =
        iz.idEquipoVisitante != null && idsZonaB.has(iz.idEquipoVisitante)
      // Uno de zona A y otro de zona B
      expect((localEnA && visitanteEnB) || (localEnB && visitanteEnA)).toBe(
        true
      )
    }
  })
})

// ─── calcularEstadisticasFixture ──────────────────────────────────────────────

describe('calcularEstadisticasFixture', () => {
  it('4 equipos ida: sin excepciones', () => {
    const eq = equipos(4)
    const fechas = generarFixture(eq, 0, 0, 'ida')
    const stats = calcularEstadisticasFixture(fechas, eq, 0, 0, 'ida')
    expect(stats.excepciones).toHaveLength(0)
  })

  it('4 equipos ida-y-vuelta: sin excepciones', () => {
    const eq = equipos(4)
    const fechas = generarFixture(eq, 0, 0, 'ida-y-vuelta')
    const stats = calcularEstadisticasFixture(fechas, eq, 0, 0, 'ida-y-vuelta')
    expect(stats.excepciones).toHaveLength(0)
  })

  it('ida: encuentrosPorParEsperados = 1', () => {
    const eq = equipos(4)
    const fechas = generarFixture(eq, 0, 0, 'ida')
    const stats = calcularEstadisticasFixture(fechas, eq, 0, 0, 'ida')
    expect(stats.encuentrosPorParEsperados).toBe(1)
  })

  it('ida-y-vuelta: encuentrosPorParEsperados = 2', () => {
    const eq = equipos(4)
    const fechas = generarFixture(eq, 0, 0, 'ida-y-vuelta')
    const stats = calcularEstadisticasFixture(fechas, eq, 0, 0, 'ida-y-vuelta')
    expect(stats.encuentrosPorParEsperados).toBe(2)
  })

  it('4 equipos ida y vuelta: partidosLocalEsperados = partidosVisitanteEsperados = 3', () => {
    const eq = equipos(4)
    const fechas = generarFixture(eq, 0, 0, 'ida-y-vuelta')
    const stats = calcularEstadisticasFixture(fechas, eq, 0, 0, 'ida-y-vuelta')
    expect(stats.partidosLocalEsperados).toBe(3)
    expect(stats.partidosVisitanteEsperados).toBe(3)
  })

  it('4 equipos ida: totalFechas = 3', () => {
    const eq = equipos(4)
    const fechas = generarFixture(eq, 0, 0, 'ida')
    const stats = calcularEstadisticasFixture(fechas, eq, 0, 0, 'ida')
    expect(stats.totalFechas).toBe(3)
  })

  it('contiene estadisticas para todos los equipos', () => {
    const eq = equipos(4)
    const fechas = generarFixture(eq, 0, 0, 'ida')
    const stats = calcularEstadisticasFixture(fechas, eq, 0, 0, 'ida')
    expect(stats.estadisticasPorEquipo).toHaveLength(4)
    const ids = stats.estadisticasPorEquipo.map((e) => e.idEquipo)
    expect(ids).toContain(1)
    expect(ids).toContain(4)
  })

  it('con 1 libre: cada equipo tiene fechasLibre = 1 en estadisticas', () => {
    // T = 3 + 1 = 4 (par)
    const eq = equipos(3)
    const fechas = generarFixture(eq, 1, 0, 'ida')
    const stats = calcularEstadisticasFixture(fechas, eq, 1, 0, 'ida')
    for (const est of stats.estadisticasPorEquipo) {
      expect(est.fechasLibre).toBe(1)
    }
    expect(stats.excepciones).toHaveLength(0)
  })

  it('con 2 interzonales: cada equipo tiene fechasInterzonal = 2 en estadisticas', () => {
    // T = 4 + 2 = 6 (par)
    const eq = equipos(4)
    const fechas = generarFixture(eq, 0, 2, 'ida')
    const stats = calcularEstadisticasFixture(fechas, eq, 0, 2, 'ida')
    for (const est of stats.estadisticasPorEquipo) {
      expect(est.fechasInterzonal).toBe(2)
    }
  })

  it('6 equipos ida: sin excepciones', () => {
    const eq = equipos(6)
    const fechas = generarFixture(eq, 0, 0, 'ida')
    const stats = calcularEstadisticasFixture(fechas, eq, 0, 0, 'ida')
    expect(stats.excepciones).toHaveLength(0)
  })

  it('par que no se enfrenta genera excepción', () => {
    const eq = equipos(4)
    const fechas = generarFixture(eq, 0, 0, 'ida')
    // Modificamos para que equipo 1 vs equipo 2 nunca se enfrenten:
    // reemplazamos todas las entradas donde participen ambos por un placeholder
    const fechasModificadas = fechas.map((f) => ({
      ...f,
      entradas: f.entradas.map((e) => {
        if (
          (e.idEquipoLocal === 1 && e.idEquipoVisitante === 2) ||
          (e.idEquipoLocal === 2 && e.idEquipoVisitante === 1)
        ) {
          return { ...e, idEquipoLocal: null, idEquipoVisitante: null }
        }
        return e
      })
    }))
    const stats = calcularEstadisticasFixture(
      fechasModificadas,
      eq,
      0,
      0,
      'ida'
    )
    expect(stats.excepciones.some((e) => e.includes('vs'))).toBe(true)
  })

  it('ida-y-vuelta: par que juega 3 veces genera excepción', () => {
    const eq = equipos(4)
    const fechas = generarFixture(eq, 0, 0, 'ida-y-vuelta')
    // Duplicamos la primera entrada regular encontrada
    const fechasModificadas = fechas.map((f, fi) => {
      if (fi !== 0) return f
      const primera = f.entradas.find((e) => e.tipo === 'regular')
      if (!primera) return f
      return {
        ...f,
        entradas: [...f.entradas, { ...primera, id: primera.id + '-dup' }]
      }
    })
    const stats = calcularEstadisticasFixture(
      fechasModificadas,
      eq,
      0,
      0,
      'ida-y-vuelta'
    )
    expect(stats.excepciones.length).toBeGreaterThan(0)
  })

  // ── Regresión: IDs no ordenados ──────────────────────────────────────────────

  it('equipos con IDs no ordenados: sin falsas excepciones de encuentros', () => {
    // Bug: la clave del par se calculaba como "equipos[i].id-equipos[j].id" sin
    // ordenar, pero al registrar sí se ordenaba → claves distintas → 0 encuentros
    const eq = [
      { id: 10, nombre: 'Equipo A' },
      { id: 3, nombre: 'Equipo B' },
      { id: 7, nombre: 'Equipo C' },
      { id: 1, nombre: 'Equipo D' }
    ]
    const fechas = generarFixture(eq, 0, 0, 'ida')
    const stats = calcularEstadisticasFixture(fechas, eq, 0, 0, 'ida')
    expect(stats.excepciones).toHaveLength(0)
  })

  it('equipos con IDs no ordenados, ida-y-vuelta: sin falsas excepciones', () => {
    const eq = [
      { id: 10, nombre: 'Equipo A' },
      { id: 3, nombre: 'Equipo B' },
      { id: 7, nombre: 'Equipo C' },
      { id: 1, nombre: 'Equipo D' }
    ]
    const fechas = generarFixture(eq, 0, 0, 'ida-y-vuelta')
    const stats = calcularEstadisticasFixture(fechas, eq, 0, 0, 'ida-y-vuelta')
    expect(stats.excepciones).toHaveLength(0)
  })

  // ── Excepciones de local/visitante ───────────────────────────────────────────

  it('ida-y-vuelta: equipo con demasiados partidos de local → excepción', () => {
    // 2 equipos ida-y-vuelta: cada uno debe jugar 1 local y 1 visitante.
    // Construimos ambas fechas con el mismo equipo siempre de local.
    const eq = [
      { id: 1, nombre: 'Equipo 1' },
      { id: 2, nombre: 'Equipo 2' }
    ]
    const fechas: FechaFixture[] = [
      {
        numeroFecha: 1,
        entradas: [
          {
            id: 'p1',
            tipo: 'regular',
            local: 'Equipo 1',
            visitante: 'Equipo 2',
            idEquipoLocal: 1,
            idEquipoVisitante: 2
          }
        ]
      },
      {
        numeroFecha: 2,
        entradas: [
          {
            id: 'p2',
            tipo: 'regular',
            local: 'Equipo 1', // debería ser visitante en la vuelta
            visitante: 'Equipo 2',
            idEquipoLocal: 1,
            idEquipoVisitante: 2
          }
        ]
      }
    ]
    const stats = calcularEstadisticasFixture(fechas, eq, 0, 0, 'ida-y-vuelta')
    // Equipo 1: 2 local + 0 visitante (esperado 1/1) → excepción
    expect(
      stats.excepciones.some(
        (e) => e.includes('Equipo 1') && e.includes('local')
      )
    ).toBe(true)
    // Equipo 2: 0 local + 2 visitante → excepción
    expect(
      stats.excepciones.some(
        (e) => e.includes('Equipo 2') && e.includes('visitante')
      )
    ).toBe(true)
  })

  it('ida: equipo con distribución local/visitante fuera del rango esperado → excepción', () => {
    // 4 equipos ida: N-1=3, localEsperado=1, visitanteEsperado=2.
    // Construimos un fixture donde Equipo 1 juega siempre de local (3 local, 0 visitante).
    const eq = [
      { id: 1, nombre: 'Equipo 1' },
      { id: 2, nombre: 'Equipo 2' },
      { id: 3, nombre: 'Equipo 3' },
      { id: 4, nombre: 'Equipo 4' }
    ]
    const fechas: FechaFixture[] = [
      {
        numeroFecha: 1,
        entradas: [
          {
            id: 'p1',
            tipo: 'regular',
            local: 'Equipo 1',
            visitante: 'Equipo 2',
            idEquipoLocal: 1,
            idEquipoVisitante: 2
          },
          {
            id: 'p2',
            tipo: 'regular',
            local: 'Equipo 3',
            visitante: 'Equipo 4',
            idEquipoLocal: 3,
            idEquipoVisitante: 4
          }
        ]
      },
      {
        numeroFecha: 2,
        entradas: [
          {
            id: 'p3',
            tipo: 'regular',
            local: 'Equipo 1',
            visitante: 'Equipo 3',
            idEquipoLocal: 1,
            idEquipoVisitante: 3
          },
          {
            id: 'p4',
            tipo: 'regular',
            local: 'Equipo 2',
            visitante: 'Equipo 4',
            idEquipoLocal: 2,
            idEquipoVisitante: 4
          }
        ]
      },
      {
        numeroFecha: 3,
        entradas: [
          {
            id: 'p5',
            tipo: 'regular',
            local: 'Equipo 1',
            visitante: 'Equipo 4',
            idEquipoLocal: 1,
            idEquipoVisitante: 4
          },
          {
            id: 'p6',
            tipo: 'regular',
            local: 'Equipo 2',
            visitante: 'Equipo 3',
            idEquipoLocal: 2,
            idEquipoVisitante: 3
          }
        ]
      }
    ]
    // Equipo 1: 3 local + 0 visitante → fuera de [1, 2] → excepción
    const stats = calcularEstadisticasFixture(fechas, eq, 0, 0, 'ida')
    expect(
      stats.excepciones.some(
        (e) => e.includes('Equipo 1') && e.includes('local')
      )
    ).toBe(true)
  })
})

// ─── intercambiarEquiposEnFecha ───────────────────────────────────────────────

// Fixture mínimo para tests: 2 partidos en la fecha 1
const crearFechasTest = (): FechaFixture[] => [
  {
    numeroFecha: 1,
    entradas: [
      {
        id: 'p1',
        tipo: 'regular',
        local: 'E1',
        visitante: 'E2',
        idEquipoLocal: 1,
        idEquipoVisitante: 2
      },
      {
        id: 'p2',
        tipo: 'regular',
        local: 'E3',
        visitante: 'E4',
        idEquipoLocal: 3,
        idEquipoVisitante: 4
      }
    ]
  },
  {
    numeroFecha: 2,
    entradas: [
      {
        id: 'p3',
        tipo: 'regular',
        local: 'E1',
        visitante: 'E3',
        idEquipoLocal: 1,
        idEquipoVisitante: 3
      }
    ]
  }
]

describe('intercambiarEquiposEnFecha', () => {
  it('intercambia local ↔ visitante del mismo partido', () => {
    const fechas = crearFechasTest()
    const resultado = intercambiarEquiposEnFecha(
      fechas,
      1,
      'p1',
      'local',
      1,
      'p1',
      'visitante'
    )
    const partido = resultado[0].entradas.find((e) => e.id === 'p1')!
    expect(partido.local).toBe('E2')
    expect(partido.visitante).toBe('E1')
    expect(partido.idEquipoLocal).toBe(2)
    expect(partido.idEquipoVisitante).toBe(1)
  })

  it('intercambia local de un partido con local de otro partido en la misma fecha', () => {
    const fechas = crearFechasTest()
    const resultado = intercambiarEquiposEnFecha(
      fechas,
      1,
      'p1',
      'local',
      1,
      'p2',
      'local'
    )
    const p1 = resultado[0].entradas.find((e) => e.id === 'p1')!
    const p2 = resultado[0].entradas.find((e) => e.id === 'p2')!
    expect(p1.local).toBe('E3')
    expect(p1.idEquipoLocal).toBe(3)
    expect(p2.local).toBe('E1')
    expect(p2.idEquipoLocal).toBe(1)
    // Los visitantes no cambian
    expect(p1.visitante).toBe('E2')
    expect(p2.visitante).toBe('E4')
  })

  it('intercambia local de un partido con visitante de otro partido en la misma fecha', () => {
    const fechas = crearFechasTest()
    const resultado = intercambiarEquiposEnFecha(
      fechas,
      1,
      'p1',
      'local',
      1,
      'p2',
      'visitante'
    )
    const p1 = resultado[0].entradas.find((e) => e.id === 'p1')!
    const p2 = resultado[0].entradas.find((e) => e.id === 'p2')!
    expect(p1.local).toBe('E4')
    expect(p1.idEquipoLocal).toBe(4)
    expect(p2.visitante).toBe('E1')
    expect(p2.idEquipoVisitante).toBe(1)
  })

  it('no modifica otras fechas', () => {
    const fechas = crearFechasTest()
    const resultado = intercambiarEquiposEnFecha(
      fechas,
      1,
      'p1',
      'local',
      1,
      'p2',
      'local'
    )
    // Fecha 2 no se toca
    expect(resultado[1]).toEqual(fechas[1])
  })

  it('retorna el mismo array si origen y destino son el mismo slot', () => {
    const fechas = crearFechasTest()
    const resultado = intercambiarEquiposEnFecha(
      fechas,
      1,
      'p1',
      'local',
      1,
      'p1',
      'local'
    )
    expect(resultado).toBe(fechas) // referencia idéntica
  })

  it('retorna sin cambios si el numeroFecha origen no existe', () => {
    const fechas = crearFechasTest()
    const resultado = intercambiarEquiposEnFecha(
      fechas,
      99,
      'p1',
      'local',
      1,
      'p2',
      'local'
    )
    expect(resultado).toBe(fechas)
  })

  it('retorna sin cambios si el numeroFecha destino no existe', () => {
    const fechas = crearFechasTest()
    const resultado = intercambiarEquiposEnFecha(
      fechas,
      1,
      'p1',
      'local',
      99,
      'p2',
      'local'
    )
    expect(resultado).toBe(fechas)
  })

  it('no intercambia si el id pertenece a otra zona (id no encontrado)', () => {
    // Zona A tiene 'p1', zona B tiene 'p-zona-b'
    // Intentar intercambiar p1 con p-zona-b en las fechas de zona A → sin cambios
    const fechasZonaA = crearFechasTest()
    const resultado = intercambiarEquiposEnFecha(
      fechasZonaA,
      1,
      'p1',
      'local',
      1,
      'p-zona-b',
      'local'
    )
    expect(resultado).toBe(fechasZonaA)
  })

  it('las fechas de una zona no afectan las fechas de otra zona', () => {
    const fechasZonaA = crearFechasTest()
    const fechasZonaB: FechaFixture[] = [
      {
        numeroFecha: 1,
        entradas: [
          {
            id: 'pB1',
            tipo: 'regular',
            local: 'E5',
            visitante: 'E6',
            idEquipoLocal: 5,
            idEquipoVisitante: 6
          }
        ]
      }
    ]
    // Intercambiar en zona A
    intercambiarEquiposEnFecha(fechasZonaA, 1, 'p1', 'local', 1, 'p2', 'local')
    // Zona B no se modifica (cada zona tiene su propio array)
    expect(fechasZonaB[0].entradas[0].local).toBe('E5')
    expect(fechasZonaB[0].entradas[0].visitante).toBe('E6')
  })

  it('intercambio entre fechas distintas: mueve equipo de fecha 2 a fecha 1', () => {
    // Arrastrar local de p3 (fecha 2: E1) y soltar en local de p1 (fecha 1: E1 → resultado: E1 en ambas)
    // Usamos visitante de p3 (E3) → soltar en local de p1 (E1)
    // Después: p3.visitante = E1, p1.local = E3
    const fechas = crearFechasTest()
    const resultado = intercambiarEquiposEnFecha(
      fechas,
      2, // origenNumeroFecha
      'p3', // origenId (fecha 2)
      'visitante',
      1, // destinoNumeroFecha
      'p1', // destinoId (fecha 1)
      'local'
    )
    const p3 = resultado
      .find((d) => d.numeroFecha === 2)!
      .entradas.find((e) => e.id === 'p3')!
    const p1 = resultado
      .find((d) => d.numeroFecha === 1)!
      .entradas.find((e) => e.id === 'p1')!
    // p3.visitante recibe los datos que tenía p1.local (E1, id 1)
    expect(p3.visitante).toBe('E1')
    expect(p3.idEquipoVisitante).toBe(1)
    // p1.local recibe los datos que tenía p3.visitante (E3, id 3)
    expect(p1.local).toBe('E3')
    expect(p1.idEquipoLocal).toBe(3)
    // El resto no cambia
    expect(p1.visitante).toBe('E2')
  })
})

// ─── Integración: intercambiar local/visitante → calcularEstadisticasFixture ──

describe('intercambiar local↔visitante y recalcular estadísticas', () => {
  it('ida-y-vuelta: swap local↔visitante en mismo partido genera excepciones de local y visitante', () => {
    // 4 equipos, ida-y-vuelta: cada equipo debe jugar 3 de local y 3 de visitante.
    // Tras intercambiar local y visitante en un partido, el equipo que pierde
    // el turno de local pasa a 2 local (excepción) y el que lo gana pasa a 4 (excepción).
    const eq = [
      { id: 1, nombre: 'Equipo 1' },
      { id: 2, nombre: 'Equipo 2' },
      { id: 3, nombre: 'Equipo 3' },
      { id: 4, nombre: 'Equipo 4' }
    ]
    const fechas = generarFixture(eq, 0, 0, 'ida-y-vuelta')

    // Encontrar el primer partido regular para saber qué equipos intercambiar
    const primeraFecha = fechas[0]
    const primerPartido = primeraFecha.entradas.find(
      (e) => e.tipo === 'regular'
    )!
    const equipoLocalId = primerPartido.idEquipoLocal!
    const equipoVisitanteId = primerPartido.idEquipoVisitante!

    // Intercambiar local ↔ visitante del mismo partido
    const fechasEditadas = intercambiarEquiposEnFecha(
      fechas,
      primeraFecha.numeroFecha,
      primerPartido.id,
      'local',
      primeraFecha.numeroFecha,
      primerPartido.id,
      'visitante'
    )

    const stats = calcularEstadisticasFixture(
      fechasEditadas,
      eq,
      0,
      0,
      'ida-y-vuelta'
    )

    // El equipo que ERA local ahora juega un partido menos de local
    const nombreLocal = eq.find((e) => e.id === equipoLocalId)!.nombre
    const nombreVisitante = eq.find((e) => e.id === equipoVisitanteId)!.nombre

    expect(
      stats.excepciones.some(
        (e) => e.includes(nombreLocal) && e.includes('local')
      )
    ).toBe(true)
    expect(
      stats.excepciones.some(
        (e) => e.includes(nombreVisitante) && e.includes('local')
      )
    ).toBe(true)
  })
})

// ─── intercambiarParticipantesEnBracket ──────────────────────────────────────

describe('intercambiarParticipantesEnBracket', () => {
  it('intercambia dos participantes por índice', () => {
    const participantes = ['E1', 'E2', 'E3', 'E4']
    const resultado = intercambiarParticipantesEnBracket(participantes, 0, 3)
    expect(resultado).toEqual(['E4', 'E2', 'E3', 'E1'])
  })

  it('intercambia dos participantes del mismo partido (índices 0 y 1)', () => {
    const participantes = ['E1', 'E2', 'E3', 'E4']
    const resultado = intercambiarParticipantesEnBracket(participantes, 0, 1)
    expect(resultado).toEqual(['E2', 'E1', 'E3', 'E4'])
  })

  it('no modifica el array original', () => {
    const participantes = ['E1', 'E2', 'E3', 'E4']
    intercambiarParticipantesEnBracket(participantes, 0, 3)
    expect(participantes).toEqual(['E1', 'E2', 'E3', 'E4'])
  })

  it('retorna el mismo array si los índices son iguales', () => {
    const participantes = ['E1', 'E2', 'E3', 'E4']
    const resultado = intercambiarParticipantesEnBracket(participantes, 2, 2)
    expect(resultado).toBe(participantes)
  })

  it('retorna sin cambios si un índice está fuera de rango', () => {
    const participantes = ['E1', 'E2', 'E3', 'E4']
    expect(intercambiarParticipantesEnBracket(participantes, 0, 10)).toBe(
      participantes
    )
    expect(intercambiarParticipantesEnBracket(participantes, -1, 2)).toBe(
      participantes
    )
  })

  it('intercambiar no afecta a zonas distintas (arrays independientes)', () => {
    const participantesZonaA = ['E1', 'E2', 'E3', 'E4']
    const participantesZonaB = ['E5', 'E6', 'E7', 'E8']
    intercambiarParticipantesEnBracket(participantesZonaA, 0, 3)
    // Zona B permanece intacta
    expect(participantesZonaB).toEqual(['E5', 'E6', 'E7', 'E8'])
  })
})

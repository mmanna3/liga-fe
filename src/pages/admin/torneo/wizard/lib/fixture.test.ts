import { describe, expect, it } from 'vitest'
import {
  calculateFixtureStats,
  calculateTotalDates,
  generateAllFixtures,
  generateFixture,
  isValidConfiguration,
  mergeAndResolveInterzonal,
  validateInterzonalPairing,
  type FixtureDate,
} from './fixture'

// ─── Helpers ────────────────────────────────────────────────────────────────

const makeTeams = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    name: `Equipo ${i + 1}`,
  }))

function allRegularEntries(dates: FixtureDate[]) {
  return dates.flatMap((d) => d.entries).filter((e) => e.type === 'regular')
}

/** Cuenta cuántas veces se enfrentan cada par de equipos (sin importar local/visitante) */
function countMatchups(dates: FixtureDate[]) {
  const map = new Map<string, number>()
  for (const entry of allRegularEntries(dates)) {
    const key = [entry.homeTeamId, entry.awayTeamId]
      .sort((a, b) => (a ?? 0) - (b ?? 0))
      .join('-')
    map.set(key, (map.get(key) ?? 0) + 1)
  }
  return map
}

// ─── isValidConfiguration ───────────────────────────────────────────────────

describe('isValidConfiguration', () => {
  it('devuelve true cuando N+L+I es par', () => {
    expect(isValidConfiguration(4, 0, 0)).toBe(true)
    expect(isValidConfiguration(3, 1, 0)).toBe(true)
    expect(isValidConfiguration(5, 1, 0)).toBe(true)
    expect(isValidConfiguration(16, 2, 0)).toBe(true)
    expect(isValidConfiguration(4, 1, 1)).toBe(true)
  })

  it('devuelve false cuando N+L+I es impar', () => {
    expect(isValidConfiguration(3, 0, 0)).toBe(false)
    expect(isValidConfiguration(5, 0, 0)).toBe(false)
    expect(isValidConfiguration(16, 1, 0)).toBe(false)
    expect(isValidConfiguration(4, 1, 0)).toBe(false)
  })
})

// ─── calculateTotalDates ────────────────────────────────────────────────────

describe('calculateTotalDates', () => {
  it('calcula jornadas para solo ida', () => {
    expect(calculateTotalDates(4, 0, 0, 'single')).toBe(3)
    expect(calculateTotalDates(6, 0, 0, 'single')).toBe(5)
    expect(calculateTotalDates(5, 1, 0, 'single')).toBe(5)
    expect(calculateTotalDates(4, 1, 1, 'single')).toBe(5)
  })

  it('calcula jornadas para ida y vuelta', () => {
    expect(calculateTotalDates(4, 0, 0, 'double')).toBe(6)
    expect(calculateTotalDates(6, 0, 0, 'double')).toBe(10)
    expect(calculateTotalDates(5, 1, 0, 'double')).toBe(10)
  })

  it('devuelve 0 para menos de 2 participantes', () => {
    expect(calculateTotalDates(1, 0, 0, 'single')).toBe(0)
    expect(calculateTotalDates(0, 0, 0, 'single')).toBe(0)
  })
})

// ─── generateFixture ────────────────────────────────────────────────────────

describe('generateFixture', () => {
  it('lanza error si T es impar', () => {
    expect(() => generateFixture(makeTeams(3), 0, 0, 'single')).toThrow()
    expect(() => generateFixture(makeTeams(5), 0, 0, 'single')).toThrow()
  })

  it('devuelve array vacío si T < 2', () => {
    expect(generateFixture(makeTeams(1), 0, 0, 'single')).toEqual([])
  })

  describe('solo ida sin fantasmas', () => {
    it('genera la cantidad correcta de jornadas', () => {
      const fixture = generateFixture(makeTeams(4), 0, 0, 'single')
      expect(fixture.length).toBe(3)
    })

    it('cada equipo juega contra todos los demás exactamente 1 vez', () => {
      const fixture = generateFixture(makeTeams(6), 0, 0, 'single')
      const matchups = countMatchups(fixture)

      // C(6,2) = 15 pares únicos
      expect(matchups.size).toBe(15)
      for (const count of matchups.values()) {
        expect(count).toBe(1)
      }
    })

    it('cada equipo juega exactamente N-1 partidos', () => {
      const teams = makeTeams(6)
      const fixture = generateFixture(teams, 0, 0, 'single')
      const gamesPerTeam = new Map<number, number>()

      for (const entry of allRegularEntries(fixture)) {
        if (entry.homeTeamId != null)
          gamesPerTeam.set(
            entry.homeTeamId,
            (gamesPerTeam.get(entry.homeTeamId) ?? 0) + 1
          )
        if (entry.awayTeamId != null)
          gamesPerTeam.set(
            entry.awayTeamId,
            (gamesPerTeam.get(entry.awayTeamId) ?? 0) + 1
          )
      }

      for (const team of teams) {
        expect(gamesPerTeam.get(team.id)).toBe(5) // 6-1
      }
    })

    it('distribución local/visitante es equilibrada (±1)', () => {
      const teams = makeTeams(8)
      const fixture = generateFixture(teams, 0, 0, 'single')
      const homeCount = new Map<number, number>()
      const awayCount = new Map<number, number>()

      for (const entry of allRegularEntries(fixture)) {
        if (entry.homeTeamId != null)
          homeCount.set(
            entry.homeTeamId,
            (homeCount.get(entry.homeTeamId) ?? 0) + 1
          )
        if (entry.awayTeamId != null)
          awayCount.set(
            entry.awayTeamId,
            (awayCount.get(entry.awayTeamId) ?? 0) + 1
          )
      }

      const expected = (8 - 1) / 2 // 3.5
      for (const team of teams) {
        const h = homeCount.get(team.id) ?? 0
        const a = awayCount.get(team.id) ?? 0
        expect(h + a).toBe(7)
        expect(h).toBeGreaterThanOrEqual(Math.floor(expected))
        expect(h).toBeLessThanOrEqual(Math.ceil(expected))
      }
    })
  })

  describe('ida y vuelta sin fantasmas', () => {
    it('genera el doble de jornadas', () => {
      const fixture = generateFixture(makeTeams(4), 0, 0, 'double')
      expect(fixture.length).toBe(6)
    })

    it('cada par se enfrenta exactamente 2 veces', () => {
      const fixture = generateFixture(makeTeams(6), 0, 0, 'double')
      const matchups = countMatchups(fixture)

      expect(matchups.size).toBe(15)
      for (const count of matchups.values()) {
        expect(count).toBe(2)
      }
    })

    it('cada par juega una vez como local y una como visitante', () => {
      const fixture = generateFixture(makeTeams(6), 0, 0, 'double')
      const directed = new Map<string, number>()

      for (const entry of allRegularEntries(fixture)) {
        const key = `${entry.homeTeamId}-${entry.awayTeamId}`
        directed.set(key, (directed.get(key) ?? 0) + 1)
      }

      // Cada emparejamiento dirigido aparece exactamente 1 vez
      for (const count of directed.values()) {
        expect(count).toBe(1)
      }
    })
  })

  describe('con equipos LIBRE', () => {
    it('cada equipo real queda libre exactamente freeDates veces', () => {
      const teams = makeTeams(5)
      const fixture = generateFixture(teams, 1, 0, 'single') // T=6

      const libreCount = new Map<number, number>()
      for (const date of fixture) {
        for (const entry of date.entries) {
          if (entry.type === 'libre' && entry.homeTeamId != null) {
            libreCount.set(
              entry.homeTeamId,
              (libreCount.get(entry.homeTeamId) ?? 0) + 1
            )
          }
        }
      }

      for (const team of teams) {
        expect(libreCount.get(team.id)).toBe(1)
      }
    })

    it('LIBRE siempre aparece como visitante (equipo a la izquierda)', () => {
      const fixture = generateFixture(makeTeams(5), 1, 0, 'single')

      for (const date of fixture) {
        for (const entry of date.entries) {
          if (entry.type === 'libre') {
            expect(entry.away).toBe('LIBRE')
            expect(entry.homeTeamId).not.toBeNull()
            expect(entry.awayTeamId).toBeNull()
          }
        }
      }
    })

    it('con ida y vuelta, libre aparece en ida y vuelta (cada equipo libre 2 veces)', () => {
      const teams = makeTeams(5)
      const fixture = generateFixture(teams, 1, 0, 'double') // T=6, 10 dates

      expect(fixture.length).toBe(10)

      // Fechas de vuelta (6-10) también tienen partidos libre
      const vueltaDates = fixture.filter((d) => d.dateNumber > 5)
      const vueltaLibres = vueltaDates.flatMap((d) =>
        d.entries.filter((e) => e.type === 'libre')
      )
      expect(vueltaLibres.length).toBe(5) // 1 libre por fecha, 5 fechas vuelta

      // Cada equipo queda libre exactamente 2 veces (1 ida + 1 vuelta)
      const libreCount = new Map<number, number>()
      for (const date of fixture) {
        for (const entry of date.entries) {
          if (entry.type === 'libre' && entry.homeTeamId != null) {
            libreCount.set(
              entry.homeTeamId,
              (libreCount.get(entry.homeTeamId) ?? 0) + 1
            )
          }
        }
      }

      for (const team of teams) {
        expect(libreCount.get(team.id)).toBe(2)
      }
    })
  })

  describe('con equipos INTERZONAL', () => {
    it('cada equipo juega interzonalDates veces interzonal', () => {
      const teams = makeTeams(4)
      const fixture = generateFixture(teams, 0, 2, 'single') // T=6

      const izCount = new Map<number, number>()
      for (const date of fixture) {
        for (const entry of date.entries) {
          if (entry.type === 'interzonal') {
            const tid = entry.homeTeamId ?? entry.awayTeamId
            if (tid != null) izCount.set(tid, (izCount.get(tid) ?? 0) + 1)
          }
        }
      }

      for (const team of teams) {
        expect(izCount.get(team.id)).toBe(2)
      }
    })

    it('con ida y vuelta, interzonal aparece en ida y vuelta (cada equipo 2× interzonal)', () => {
      const teams = makeTeams(4)
      const fixture = generateFixture(teams, 0, 2, 'double') // T=6, 10 dates

      expect(fixture.length).toBe(10)

      const izCount = new Map<number, number>()
      for (const date of fixture) {
        for (const entry of date.entries) {
          if (entry.type === 'interzonal') {
            const tid = entry.homeTeamId ?? entry.awayTeamId
            if (tid != null) izCount.set(tid, (izCount.get(tid) ?? 0) + 1)
          }
        }
      }

      for (const team of teams) {
        expect(izCount.get(team.id)).toBe(4) // 2 en ida + 2 en vuelta
      }
    })

    it('INTERZONAL puede estar como local o visitante', () => {
      const fixture = generateFixture(makeTeams(4), 0, 2, 'single')
      const positions = new Set<string>()

      for (const date of fixture) {
        for (const entry of date.entries) {
          if (entry.type === 'interzonal') {
            if (entry.home === 'INTERZONAL') positions.add('home')
            if (entry.away === 'INTERZONAL') positions.add('away')
          }
        }
      }

      // Debería haber al menos alguna entrada interzonal
      expect(positions.size).toBeGreaterThanOrEqual(1)
    })
  })

  describe('orden de entradas por jornada', () => {
    it('regular primero, luego interzonal, luego libre', () => {
      const fixture = generateFixture(makeTeams(4), 1, 1, 'single') // T=6

      for (const date of fixture) {
        const types = date.entries.map((e) => e.type)
        const lastRegular = types.lastIndexOf('regular')
        const firstInterzonal = types.indexOf('interzonal')
        const lastInterzonal = types.lastIndexOf('interzonal')
        const firstLibre = types.indexOf('libre')

        if (lastRegular >= 0 && firstInterzonal >= 0) {
          expect(lastRegular).toBeLessThan(firstInterzonal)
        }
        if (lastInterzonal >= 0 && firstLibre >= 0) {
          expect(lastInterzonal).toBeLessThan(firstLibre)
        }
        if (lastRegular >= 0 && firstLibre >= 0) {
          expect(lastRegular).toBeLessThan(firstLibre)
        }
      }
    })
  })

  describe('distribución equitativa de LIBRE e INTERZONAL', () => {
    it('con ida y vuelta, libre e interzonal en ambas mitades', () => {
      const teams = makeTeams(6)
      const fixture = generateFixture(teams, 1, 1, 'double') // T=8, 7 ida + 7 vuelta

      const idaRounds = 7 // T-1
      const idaDates = fixture.filter((d) => d.dateNumber <= idaRounds)
      const vueltaDates = fixture.filter((d) => d.dateNumber > idaRounds)

      const idaLibres = idaDates.flatMap((d) =>
        d.entries.filter((e) => e.type === 'libre')
      )
      const vueltaLibres = vueltaDates.flatMap((d) =>
        d.entries.filter((e) => e.type === 'libre')
      )

      expect(idaLibres.length).toBe(vueltaLibres.length)
      expect(idaLibres.length).toBeGreaterThan(0)
    })
  })

  describe('combinación libre + interzonal', () => {
    it('genera jornadas correctas con ambos fantasmas', () => {
      const teams = makeTeams(4)
      // 4 equipos + 1 libre + 1 interzonal = 6 participantes → 5 jornadas
      const fixture = generateFixture(teams, 1, 1, 'single')

      expect(fixture.length).toBe(5)

      // Cada equipo: 3 regulares + 1 libre + 1 interzonal = 5 entradas totales
      for (const team of teams) {
        let regular = 0
        let libre = 0
        let iz = 0

        for (const date of fixture) {
          for (const entry of date.entries) {
            const isInvolved =
              entry.homeTeamId === team.id || entry.awayTeamId === team.id
            if (!isInvolved) continue

            if (entry.type === 'regular') regular++
            else if (entry.type === 'libre') libre++
            else if (entry.type === 'interzonal') iz++
          }
        }

        expect(regular).toBe(3) // N-1 = 3
        expect(libre).toBe(1)
        expect(iz).toBe(1)
      }
    })
  })
})

// ─── calculateFixtureStats ──────────────────────────────────────────────────

describe('calculateFixtureStats', () => {
  it('calcula estadísticas correctas para fixture sin fantasmas', () => {
    const teams = makeTeams(4)
    const fixture = generateFixture(teams, 0, 0, 'single')
    const stats = calculateFixtureStats(fixture, teams, 0, 0, 'single')

    expect(stats.totalDates).toBe(3)
    expect(stats.teamStats.length).toBe(4)

    for (const ts of stats.teamStats) {
      expect(ts.homeGames + ts.awayGames).toBe(3) // N-1
      expect(ts.libreDates).toBe(0)
      expect(ts.interzonalDates).toBe(0)
    }
  })

  it('detecta excepciones cuando un equipo tiene libre diferente al esperado', () => {
    const teams = makeTeams(4)
    const fixture = generateFixture(teams, 1, 1, 'single')
    const stats = calculateFixtureStats(fixture, teams, 1, 1, 'single')

    // No debería haber excepciones de libre/interzonal en un fixture recién generado
    const libreExceptions = stats.exceptions.filter((e) =>
      e.includes('libre')
    )
    const izExceptions = stats.exceptions.filter((e) =>
      e.includes('interzonal')
    )

    expect(libreExceptions.length).toBe(0)
    expect(izExceptions.length).toBe(0)
  })

  it('con ida y vuelta, cada equipo tiene libre e interzonal el doble', () => {
    const teams = makeTeams(4)
    const fixture = generateFixture(teams, 1, 1, 'double')
    const stats = calculateFixtureStats(fixture, teams, 1, 1, 'double')

    for (const ts of stats.teamStats) {
      expect(ts.libreDates).toBe(2) // 1 ida + 1 vuelta
      expect(ts.interzonalDates).toBe(2) // 1 ida + 1 vuelta
    }
  })
})

// ─── generateAllFixtures ────────────────────────────────────────────────────

describe('generateAllFixtures', () => {
  it('genera un fixture por zona con sus propias fechas libres e interzonales', () => {
    const zones = [
      {
        id: 'z1',
        name: 'Zona A',
        teams: makeTeams(4),
        freeDates: 1,
        interzonalDates: 1,
      },
      {
        id: 'z2',
        name: 'Zona B',
        teams: makeTeams(4),
        freeDates: 1,
        interzonalDates: 1,
      },
    ]

    const zoneFixtures = generateAllFixtures(zones, 'single')

    expect(zoneFixtures.length).toBe(2)
    expect(zoneFixtures[0].dates.length).toBe(5) // T=6 → 5 jornadas
    expect(zoneFixtures[1].dates.length).toBe(5)

    for (const zf of zoneFixtures) {
      const hasLibre = zf.dates.some((d) =>
        d.entries.some((e) => e.type === 'libre')
      )
      const hasInterzonal = zf.dates.some((d) =>
        d.entries.some((e) => e.type === 'interzonal')
      )
      expect(hasLibre).toBe(true)
      expect(hasInterzonal).toBe(true)
    }
  })

  it('con ida y vuelta, cada zona tiene el doble de fechas', () => {
    const zones = [
      {
        id: 'z1',
        name: 'Zona A',
        teams: makeTeams(4),
        freeDates: 0,
        interzonalDates: 0,
      },
    ]

    const zoneFixtures = generateAllFixtures(zones, 'double')
    expect(zoneFixtures[0].dates.length).toBe(6) // 3 ida + 3 vuelta
  })
})

// ─── mergeAndResolveInterzonal ───────────────────────────────────────────────

describe('mergeAndResolveInterzonal', () => {
  it('fusiona fixtures de 2 zonas y resuelve interzonales', () => {
    // T debe ser par: 4 equipos + 1 libre + 1 interzonal = 6
    const zones = [
      {
        id: 'z1',
        name: 'Zona A',
        teams: [
          { id: 1, name: 'Equipo A1' },
          { id: 2, name: 'Equipo A2' },
        ],
        freeDates: 1,
        interzonalDates: 1,
      },
      {
        id: 'z2',
        name: 'Zona B',
        teams: [
          { id: 3, name: 'Equipo B1' },
          { id: 4, name: 'Equipo B2' },
        ],
        freeDates: 1,
        interzonalDates: 1,
      },
    ]

    const zoneFixtures = generateAllFixtures(zones, 'single')
    const merged = mergeAndResolveInterzonal(zoneFixtures)

    expect(merged.length).toBeGreaterThan(0)

    const interzonalEntries = merged.flatMap((d) =>
      d.entries.filter((e) => e.type === 'interzonal')
    )
    const resolved = interzonalEntries.filter(
      (e) => e.homeTeamId != null && e.awayTeamId != null
    )
    expect(resolved.length).toBeGreaterThan(0)
  })

  it('preserva libre e interzonal en ida y vuelta del merge', () => {
    const zones = [
      {
        id: 'z1',
        name: 'Zona A',
        teams: makeTeams(4),
        freeDates: 1,
        interzonalDates: 1,
      },
      {
        id: 'z2',
        name: 'Zona B',
        teams: makeTeams(4),
        freeDates: 1,
        interzonalDates: 1,
      },
    ]

    const zoneFixtures = generateAllFixtures(zones, 'double')
    const merged = mergeAndResolveInterzonal(zoneFixtures)

    const libres = merged.flatMap((d) =>
      d.entries.filter((e) => e.type === 'libre')
    )
    const interzonales = merged.flatMap((d) =>
      d.entries.filter((e) => e.type === 'interzonal')
    )

    expect(libres.length).toBeGreaterThan(0)
    expect(interzonales.length).toBeGreaterThan(0)
  })
})

// ─── validateInterzonalPairing ──────────────────────────────────────────────

describe('validateInterzonalPairing', () => {
  it('válido cuando todas las zonas tienen el mismo interzonalDates', () => {
    const result = validateInterzonalPairing([
      { id: 'z1', name: 'A', teams: makeTeams(4), freeDates: 0, interzonalDates: 2 },
      { id: 'z2', name: 'B', teams: makeTeams(4), freeDates: 0, interzonalDates: 2 },
    ])
    expect(result.isValid).toBe(true)
  })

  it('inválido cuando zonas tienen distinto interzonalDates', () => {
    const result = validateInterzonalPairing([
      { id: 'z1', name: 'A', teams: makeTeams(4), freeDates: 0, interzonalDates: 2 },
      { id: 'z2', name: 'B', teams: makeTeams(4), freeDates: 0, interzonalDates: 1 },
    ])
    expect(result.isValid).toBe(false)
  })
})

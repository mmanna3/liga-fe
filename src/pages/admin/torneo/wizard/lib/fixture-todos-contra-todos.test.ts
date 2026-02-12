import { describe, expect, it } from 'vitest'
import {
  calculateFixtureStats,
  generateAllFixtures,
  generateFixture,
  mergeAndResolveInterzonal,
  type FixtureDate
} from './fixture'

// ─── Helpers ────────────────────────────────────────────────────────────────

const makeTeams = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    name: `Equipo ${i + 1}`
  }))

function allRegularEntries(dates: FixtureDate[]) {
  return dates.flatMap((d) => d.entries).filter((e) => e.type === 'regular')
}

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

function countGamesPerTeam(dates: FixtureDate[]) {
  const map = new Map<number, number>()
  for (const entry of allRegularEntries(dates)) {
    if (entry.homeTeamId != null)
      map.set(entry.homeTeamId, (map.get(entry.homeTeamId) ?? 0) + 1)
    if (entry.awayTeamId != null)
      map.set(entry.awayTeamId, (map.get(entry.awayTeamId) ?? 0) + 1)
  }
  return map
}

function countHomeAway(dates: FixtureDate[]) {
  const home = new Map<number, number>()
  const away = new Map<number, number>()
  for (const entry of allRegularEntries(dates)) {
    if (entry.homeTeamId != null)
      home.set(entry.homeTeamId, (home.get(entry.homeTeamId) ?? 0) + 1)
    if (entry.awayTeamId != null)
      away.set(entry.awayTeamId, (away.get(entry.awayTeamId) ?? 0) + 1)
  }
  return { home, away }
}

function countLibrePerTeam(dates: FixtureDate[]) {
  const map = new Map<number, number>()
  for (const date of dates) {
    for (const entry of date.entries) {
      if (entry.type === 'libre' && entry.homeTeamId != null) {
        map.set(entry.homeTeamId, (map.get(entry.homeTeamId) ?? 0) + 1)
      }
    }
  }
  return map
}

function countInterzonalPerTeam(dates: FixtureDate[]) {
  const map = new Map<number, number>()
  for (const date of dates) {
    for (const entry of date.entries) {
      if (entry.type === 'interzonal') {
        const tid = entry.homeTeamId ?? entry.awayTeamId
        if (tid != null) map.set(tid, (map.get(tid) ?? 0) + 1)
      }
    }
  }
  return map
}

// ─── generateFixture: errores y vacío ──────────────────────────────────────

describe('generateFixture basico', () => {
  it('lanza error si T es impar', () => {
    expect(() => generateFixture(makeTeams(3), 0, 0, 'single')).toThrow()
    expect(() => generateFixture(makeTeams(5), 0, 0, 'single')).toThrow()
  })

  it('devuelve array vacío si T < 2', () => {
    expect(generateFixture(makeTeams(1), 0, 0, 'single')).toEqual([])
    expect(generateFixture([], 0, 0, 'single')).toEqual([])
  })
})

// ─── Solo ida ──────────────────────────────────────────────────────────────

describe('solo ida sin fantasmas', () => {
  it.each([4, 6, 8, 10, 12])('%i equipos: jornadas correctas', (n) => {
    const fixture = generateFixture(makeTeams(n), 0, 0, 'single')
    expect(fixture.length).toBe(n - 1)
  })

  it.each([4, 6, 8, 10, 12])(
    '%i equipos: cada par se enfrenta exactamente 1 vez',
    (n) => {
      const fixture = generateFixture(makeTeams(n), 0, 0, 'single')
      const matchups = countMatchups(fixture)
      const expectedPairs = (n * (n - 1)) / 2
      expect(matchups.size).toBe(expectedPairs)
      for (const count of matchups.values()) {
        expect(count).toBe(1)
      }
    }
  )

  it.each([4, 6, 8, 10, 12])(
    '%i equipos: cada equipo juega N-1 partidos',
    (n) => {
      const teams = makeTeams(n)
      const fixture = generateFixture(teams, 0, 0, 'single')
      const gamesPerTeam = countGamesPerTeam(fixture)
      for (const team of teams) {
        expect(gamesPerTeam.get(team.id)).toBe(n - 1)
      }
    }
  )

  it.each([4, 6, 8, 10, 12])(
    '%i equipos: distribución local/visitante equilibrada (±1)',
    (n) => {
      const teams = makeTeams(n)
      const fixture = generateFixture(teams, 0, 0, 'single')
      const { home, away } = countHomeAway(fixture)
      const expected = (n - 1) / 2
      for (const team of teams) {
        const h = home.get(team.id) ?? 0
        const a = away.get(team.id) ?? 0
        expect(h + a).toBe(n - 1)
        expect(h).toBeGreaterThanOrEqual(Math.floor(expected))
        expect(h).toBeLessThanOrEqual(Math.ceil(expected))
      }
    }
  )
})

// ─── Ida y vuelta ──────────────────────────────────────────────────────────

describe('ida y vuelta sin fantasmas', () => {
  it.each([4, 6, 8])('%i equipos: doble de jornadas', (n) => {
    const fixture = generateFixture(makeTeams(n), 0, 0, 'double')
    expect(fixture.length).toBe((n - 1) * 2)
  })

  it.each([4, 6, 8])('%i equipos: cada par se enfrenta 2 veces', (n) => {
    const fixture = generateFixture(makeTeams(n), 0, 0, 'double')
    const matchups = countMatchups(fixture)
    const expectedPairs = (n * (n - 1)) / 2
    expect(matchups.size).toBe(expectedPairs)
    for (const count of matchups.values()) {
      expect(count).toBe(2)
    }
  })

  it.each([4, 6, 8])(
    '%i equipos: cada par juega 1 vez como local y 1 como visitante',
    (n) => {
      const fixture = generateFixture(makeTeams(n), 0, 0, 'double')
      const directed = new Map<string, number>()
      for (const entry of allRegularEntries(fixture)) {
        const key = `${entry.homeTeamId}-${entry.awayTeamId}`
        directed.set(key, (directed.get(key) ?? 0) + 1)
      }
      for (const count of directed.values()) {
        expect(count).toBe(1)
      }
    }
  )
})

// ─── Con LIBRE ─────────────────────────────────────────────────────────────

describe('con equipos LIBRE', () => {
  it.each([
    { n: 3, free: 1, label: '3+1' },
    { n: 5, free: 1, label: '5+1' },
    { n: 7, free: 1, label: '7+1' },
    { n: 4, free: 2, label: '4+2' }
  ])(
    '$label: cada equipo queda libre exactamente $free veces',
    ({ n, free }) => {
      const teams = makeTeams(n)
      const fixture = generateFixture(teams, free, 0, 'single')
      const libreCount = countLibrePerTeam(fixture)
      for (const team of teams) {
        expect(libreCount.get(team.id)).toBe(free)
      }
    }
  )

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

  it.each([
    { n: 3, free: 1, label: '3+1' },
    { n: 5, free: 1, label: '5+1' },
    { n: 7, free: 1, label: '7+1' }
  ])(
    '$label ida y vuelta: libre aparece el doble de veces',
    ({ n, free }) => {
      const teams = makeTeams(n)
      const fixture = generateFixture(teams, free, 0, 'double')
      const libreCount = countLibrePerTeam(fixture)
      for (const team of teams) {
        expect(libreCount.get(team.id)).toBe(free * 2)
      }
    }
  )
})

// ─── Con INTERZONAL ────────────────────────────────────────────────────────

describe('con equipos INTERZONAL', () => {
  it.each([
    { n: 4, iz: 2, label: '4+2' },
    { n: 6, iz: 2, label: '6+2' }
  ])(
    '$label: cada equipo juega interzonal $iz veces',
    ({ n, iz }) => {
      const teams = makeTeams(n)
      const fixture = generateFixture(teams, 0, iz, 'single')
      const izCount = countInterzonalPerTeam(fixture)
      for (const team of teams) {
        expect(izCount.get(team.id)).toBe(iz)
      }
    }
  )

  it('con ida y vuelta, interzonal aparece el doble', () => {
    const teams = makeTeams(4)
    const fixture = generateFixture(teams, 0, 2, 'double')
    expect(fixture.length).toBe(10)
    const izCount = countInterzonalPerTeam(fixture)
    for (const team of teams) {
      expect(izCount.get(team.id)).toBe(4) // 2 ida + 2 vuelta
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
    expect(positions.size).toBeGreaterThanOrEqual(1)
  })
})

// ─── Combinación libre + interzonal ────────────────────────────────────────

describe('combinación libre + interzonal', () => {
  it.each([
    { n: 4, free: 1, iz: 1, label: '4+1+1' },
    { n: 6, free: 1, iz: 1, label: '6+1+1' }
  ])(
    '$label: cada equipo tiene partidos regulares, libre e interzonal correctos',
    ({ n, free, iz }) => {
      const teams = makeTeams(n)
      const T = n + free + iz
      const fixture = generateFixture(teams, free, iz, 'single')
      expect(fixture.length).toBe(T - 1)

      for (const team of teams) {
        let regular = 0
        let libreCount = 0
        let izCount = 0

        for (const date of fixture) {
          for (const entry of date.entries) {
            const isInvolved =
              entry.homeTeamId === team.id || entry.awayTeamId === team.id
            if (!isInvolved) continue
            if (entry.type === 'regular') regular++
            else if (entry.type === 'libre') libreCount++
            else if (entry.type === 'interzonal') izCount++
          }
        }

        expect(regular).toBe(n - 1)
        expect(libreCount).toBe(free)
        expect(izCount).toBe(iz)
      }
    }
  )
})

// ─── Orden de entradas ─────────────────────────────────────────────────────

describe('orden de entradas por jornada', () => {
  it('regular primero, luego interzonal, luego libre', () => {
    const fixture = generateFixture(makeTeams(4), 1, 1, 'single')
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

// ─── Distribución equitativa ───────────────────────────────────────────────

describe('distribución equitativa de LIBRE e INTERZONAL', () => {
  it('con ida y vuelta, libre e interzonal en ambas mitades', () => {
    const teams = makeTeams(6)
    const fixture = generateFixture(teams, 1, 1, 'double')
    const idaRounds = 7
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

// ─── Multi-zona: generateAllFixtures ───────────────────────────────────────

describe('generateAllFixtures', () => {
  it('1 zona: genera fixture correctamente', () => {
    const zones = [
      { id: 'z1', name: 'A', teams: makeTeams(4), freeDates: 0, interzonalDates: 0 }
    ]
    const result = generateAllFixtures(zones, 'single')
    expect(result.length).toBe(1)
    expect(result[0].dates.length).toBe(3)
  })

  it('2 zonas con libre e interzonal', () => {
    const zones = [
      { id: 'z1', name: 'A', teams: makeTeams(4), freeDates: 1, interzonalDates: 1 },
      { id: 'z2', name: 'B', teams: makeTeams(4), freeDates: 1, interzonalDates: 1 }
    ]
    const result = generateAllFixtures(zones, 'single')
    expect(result.length).toBe(2)
    expect(result[0].dates.length).toBe(5)
    expect(result[1].dates.length).toBe(5)
    for (const zf of result) {
      expect(zf.dates.some((d) => d.entries.some((e) => e.type === 'libre'))).toBe(true)
      expect(zf.dates.some((d) => d.entries.some((e) => e.type === 'interzonal'))).toBe(true)
    }
  })

  it('3 zonas de distinto tamaño', () => {
    const zones = [
      { id: 'z1', name: 'A', teams: makeTeams(4), freeDates: 0, interzonalDates: 2 },
      { id: 'z2', name: 'B', teams: makeTeams(6), freeDates: 0, interzonalDates: 2 },
      { id: 'z3', name: 'C', teams: makeTeams(4), freeDates: 0, interzonalDates: 2 }
    ]
    const result = generateAllFixtures(zones, 'single')
    expect(result.length).toBe(3)
    expect(result[0].dates.length).toBe(5) // T=6 -> 5
    expect(result[1].dates.length).toBe(7) // T=8 -> 7
    expect(result[2].dates.length).toBe(5)
  })

  it('5 zonas simples', () => {
    const zones = Array.from({ length: 5 }, (_, i) => ({
      id: `z${i}`,
      name: `Zona ${i}`,
      teams: makeTeams(4),
      freeDates: 0,
      interzonalDates: 0
    }))
    const result = generateAllFixtures(zones, 'single')
    expect(result.length).toBe(5)
    for (const zf of result) {
      expect(zf.dates.length).toBe(3)
    }
  })

  it('ida y vuelta: cada zona tiene el doble de fechas', () => {
    const zones = [
      { id: 'z1', name: 'A', teams: makeTeams(4), freeDates: 0, interzonalDates: 0 }
    ]
    const result = generateAllFixtures(zones, 'double')
    expect(result[0].dates.length).toBe(6)
  })
})

// ─── mergeAndResolveInterzonal ─────────────────────────────────────────────

describe('mergeAndResolveInterzonal', () => {
  it('fusiona 2 zonas y resuelve interzonales', () => {
    const zones = [
      {
        id: 'z1', name: 'A',
        teams: [{ id: 1, name: 'A1' }, { id: 2, name: 'A2' }],
        freeDates: 1, interzonalDates: 1
      },
      {
        id: 'z2', name: 'B',
        teams: [{ id: 3, name: 'B1' }, { id: 4, name: 'B2' }],
        freeDates: 1, interzonalDates: 1
      }
    ]
    const fixtures = generateAllFixtures(zones, 'single')
    const merged = mergeAndResolveInterzonal(fixtures)

    expect(merged.length).toBeGreaterThan(0)
    const interzonalEntries = merged.flatMap((d) =>
      d.entries.filter((e) => e.type === 'interzonal')
    )
    const resolved = interzonalEntries.filter(
      (e) => e.homeTeamId != null && e.awayTeamId != null
    )
    expect(resolved.length).toBeGreaterThan(0)
  })

  it('fusiona 3 zonas con interzonal par', () => {
    const zones = [
      { id: 'z1', name: 'A', teams: makeTeams(4), freeDates: 0, interzonalDates: 2 },
      {
        id: 'z2', name: 'B',
        teams: Array.from({ length: 4 }, (_, i) => ({ id: 100 + i, name: `B${i + 1}` })),
        freeDates: 0, interzonalDates: 2
      },
      {
        id: 'z3', name: 'C',
        teams: Array.from({ length: 4 }, (_, i) => ({ id: 200 + i, name: `C${i + 1}` })),
        freeDates: 0, interzonalDates: 2
      }
    ]
    const fixtures = generateAllFixtures(zones, 'single')
    const merged = mergeAndResolveInterzonal(fixtures)

    expect(merged.length).toBeGreaterThan(0)
    const resolved = merged.flatMap((d) =>
      d.entries.filter(
        (e) => e.type === 'interzonal' && e.homeTeamId != null && e.awayTeamId != null
      )
    )
    expect(resolved.length).toBeGreaterThan(0)
  })

  it('preserva libre e interzonal en ida y vuelta', () => {
    const zones = [
      { id: 'z1', name: 'A', teams: makeTeams(4), freeDates: 1, interzonalDates: 1 },
      { id: 'z2', name: 'B', teams: makeTeams(4), freeDates: 1, interzonalDates: 1 }
    ]
    const fixtures = generateAllFixtures(zones, 'double')
    const merged = mergeAndResolveInterzonal(fixtures)

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

// ─── calculateFixtureStats ─────────────────────────────────────────────────

describe('calculateFixtureStats', () => {
  it('calcula estadísticas correctas sin fantasmas', () => {
    const teams = makeTeams(4)
    const fixture = generateFixture(teams, 0, 0, 'single')
    const stats = calculateFixtureStats(fixture, teams, 0, 0, 'single')

    expect(stats.totalDates).toBe(3)
    expect(stats.teamStats.length).toBe(4)
    for (const ts of stats.teamStats) {
      expect(ts.homeGames + ts.awayGames).toBe(3)
      expect(ts.libreDates).toBe(0)
      expect(ts.interzonalDates).toBe(0)
    }
  })

  it('sin excepciones de libre/interzonal en fixture recién generado', () => {
    const teams = makeTeams(4)
    const fixture = generateFixture(teams, 1, 1, 'single')
    const stats = calculateFixtureStats(fixture, teams, 1, 1, 'single')

    const libreExceptions = stats.exceptions.filter((e) => e.includes('libre'))
    const izExceptions = stats.exceptions.filter((e) => e.includes('interzonal'))
    expect(libreExceptions.length).toBe(0)
    expect(izExceptions.length).toBe(0)
  })

  it('ida y vuelta: libre e interzonal el doble', () => {
    const teams = makeTeams(4)
    const fixture = generateFixture(teams, 1, 1, 'double')
    const stats = calculateFixtureStats(fixture, teams, 1, 1, 'double')

    for (const ts of stats.teamStats) {
      expect(ts.libreDates).toBe(2)
      expect(ts.interzonalDates).toBe(2)
    }
  })

  it('8 equipos solo ida: stats tienen expectedHomeGames y expectedAwayGames', () => {
    const teams = makeTeams(8)
    const fixture = generateFixture(teams, 0, 0, 'single')
    const stats = calculateFixtureStats(fixture, teams, 0, 0, 'single')

    expect(stats.expectedHomeGames).toBe(3)
    expect(stats.expectedAwayGames).toBe(4)
    expect(stats.totalDates).toBe(7)
  })
})

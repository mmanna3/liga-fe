/**
 * Generación de fixture mediante round-robin con equipos fantasma.
 *
 * El fixture se genera POR ZONA. Cada zona tiene su propio round-robin
 * independiente. Se agregan L equipos "LIBRE" e I equipos "INTERZONAL"
 * como participantes fantasma al round-robin de cada zona (circle method).
 *
 * Restricción: para cada zona, N_zona + L + I debe ser par.
 */

// ─── Tipos públicos ─────────────────────────────────────────────────────────

export interface FixtureEntry {
  id: string
  type: 'regular' | 'libre' | 'interzonal'
  home: string
  away: string
  homeTeamId: number | null
  awayTeamId: number | null
}

export interface FixtureDate {
  dateNumber: number
  entries: FixtureEntry[]
}

export interface TeamStats {
  teamId: number
  teamName: string
  homeGames: number
  awayGames: number
  libreDates: number
  interzonalDates: number
}

export interface FixtureStats {
  totalDates: number
  teamStats: TeamStats[]
  expectedHomeGames: number
  expectedAwayGames: number
  /** Diferencias respecto a la distribución ideal */
  exceptions: string[]
}

export interface ZoneFixture {
  zoneId: string
  zoneName: string
  dates: FixtureDate[]
  stats: FixtureStats
}

export interface ZoneValidation {
  zoneId: string
  zoneName: string
  teamCount: number
  totalParticipants: number
  isValid: boolean
}

export interface InterzonalPairingValidation {
  isValid: boolean
  message: string
}

// ─── Tipos internos ─────────────────────────────────────────────────────────

type ParticipantType = 'team' | 'libre' | 'interzonal'

interface Participant {
  type: ParticipantType
  teamId: number | null
  name: string
}

export interface ZoneInput {
  id: string
  name: string
  teams: { id: number; name: string }[]
  /** Cantidad de fechas libres por equipo en esta zona */
  freeDates: number
  /** Cantidad de fechas interzonales por equipo. Todas las zonas deben tener el mismo valor para poder emparejar. */
  interzonalDates: number
}

// ─── Funciones públicas: validación ─────────────────────────────────────────

/** Devuelve true si N + freeDates + interzonalDates es par (para una zona) */
export function isValidConfiguration(
  teamCount: number,
  freeDates: number,
  interzonalDates: number
): boolean {
  const T = teamCount + freeDates + interzonalDates
  return T >= 2 && T % 2 === 0
}

/** Valida cada zona individualmente (freeDates e interzonalDates por zona) */
export function validateZones(zones: ZoneInput[]): ZoneValidation[] {
  return zones.map((zone) => {
    const freeDates = zone.freeDates ?? 0
    const interzonalDates = zone.interzonalDates ?? 0
    const T = zone.teams.length + freeDates + interzonalDates
    return {
      zoneId: zone.id,
      zoneName: zone.name,
      teamCount: zone.teams.length,
      totalParticipants: T,
      isValid: T >= 2 && T % 2 === 0,
    }
  })
}

/**
 * Valida que el emparejamiento interzonal sea posible.
 * Para que cada equipo tenga rival en cada fecha, TODAS las zonas deben tener
 * la misma cantidad de interzonalDates (o todas 0).
 */
export function validateInterzonalPairing(
  zones: ZoneInput[]
): InterzonalPairingValidation {
  if (zones.length <= 1) {
    return { isValid: true, message: '' }
  }

  const values = zones.map((z) => z.interzonalDates ?? 0)
  const withInterzonal = values.filter((v) => v > 0)

  if (withInterzonal.length === 0) {
    return { isValid: true, message: '' }
  }

  const first = withInterzonal[0]
  const allSame = withInterzonal.every((v) => v === first)

  if (!allSame) {
    const byZone = zones
      .filter((z) => (z.interzonalDates ?? 0) > 0)
      .map((z) => `${z.name}: ${z.interzonalDates}`)
      .join(', ')
    return {
      isValid: false,
      message: `Todas las zonas deben tener la misma cantidad de fechas interzonales por equipo para que cada equipo tenga rival en cada fecha. Actual: ${byZone}`,
    }
  }

  const zonesWithZero = zones.filter((z) => (z.interzonalDates ?? 0) === 0)
  if (zonesWithZero.length > 0) {
    return {
      isValid: false,
      message: `Las zonas ${zonesWithZero.map((z) => z.name).join(', ')} tienen 0 interzonal mientras otras tienen ${first}. Todas deben ser iguales.`,
    }
  }

  if (zones.length >= 3 && first % 2 !== 0) {
    return {
      isValid: false,
      message: `Con 3 o más zonas, la cantidad interzonal debe ser par para que cada equipo tenga rival en cada fecha (actual: ${first}).`,
    }
  }

  return { isValid: true, message: '' }
}

/** Cantidad total de jornadas para una zona (cálculo POR ZONA) */
export function calculateTotalDates(
  teamCount: number,
  freeDates: number,
  interzonalDates: number,
  rounds: 'single' | 'double'
): number {
  const T = teamCount + freeDates + interzonalDates
  if (T < 2) return 0
  const idaDates = T - 1
  return rounds === 'double' ? idaDates * 2 : idaDates
}

/** Cantidad de jornadas cuando hay zonas: cada zona tiene su propio cálculo. Retorna el máximo. */
export function calculateTotalDatesForZones(
  zones: ZoneInput[],
  rounds: 'single' | 'double'
): number {
  if (zones.length === 0) return 0
  const datesPerZone = zones.map((z) =>
    calculateTotalDates(
      z.teams.length,
      z.freeDates ?? 0,
      z.interzonalDates ?? 0,
      rounds
    )
  )
  return Math.max(...datesPerZone)
}

// ─── Funciones públicas: generación ─────────────────────────────────────────

/**
 * Genera el fixture de una sola zona.
 *
 * @throws si N + freeDates + interzonalDates es impar
 */
export function generateFixture(
  teams: { id: number; name: string }[],
  freeDates: number,
  interzonalDates: number,
  rounds: 'single' | 'double'
): FixtureDate[] {
  const N = teams.length
  const T = N + freeDates + interzonalDates

  if (T < 2) return []

  if (T % 2 !== 0) {
    throw new Error(
      `La cantidad total de participantes (${T}) debe ser par. ` +
        `Equipos: ${N}, Libre: ${freeDates}, Interzonal: ${interzonalDates}`
    )
  }

  // Mezclar equipos reales
  const shuffled = [...teams].sort(() => Math.random() - 0.5)

  // Ordenar participantes: equipos primero, phantoms al final (rotación completa).
  const fixedTeam = shuffled[0]
  const otherTeams = shuffled.slice(1)
  const phantoms: Participant[] = [
    ...Array.from({ length: freeDates }, () => ({
      type: 'libre' as const,
      teamId: null as number | null,
      name: 'LIBRE',
    })),
    ...Array.from({ length: interzonalDates }, () => ({
      type: 'interzonal' as const,
      teamId: null as number | null,
      name: 'INTERZONAL',
    })),
  ]
  const participants: Participant[] = [
    { type: 'team', teamId: fixedTeam.id, name: fixedTeam.name },
    ...otherTeams.map((t) => ({
      type: 'team' as const,
      teamId: t.id,
      name: t.name,
    })),
    ...phantoms,
  ]

  const idaDates = circleMethod(participants, T)

  if (rounds === 'single') return idaDates

  // Vuelta: mismos partidos que ida (regular, libre, interzonal), con local/visitante invertidos
  const vueltaDates: FixtureDate[] = idaDates.map((idaDate, idx) => {
    const vueltaEntries: FixtureEntry[] = []
    let matchIdx = 0

    for (const e of idaDate.entries) {
      if (e.type === 'regular') {
        vueltaEntries.push({
          id: `vuelta-d${idx + 1}-m${matchIdx}`,
          type: 'regular',
          home: e.away,
          away: e.home,
          homeTeamId: e.awayTeamId,
          awayTeamId: e.homeTeamId,
        })
        matchIdx++
      } else if (e.type === 'libre') {
        vueltaEntries.push({
          id: `vuelta-d${idx + 1}-m${matchIdx}`,
          type: 'libre',
          home: e.home,
          away: e.away,
          homeTeamId: e.homeTeamId,
          awayTeamId: e.awayTeamId,
        })
        matchIdx++
      } else if (e.type === 'interzonal') {
        vueltaEntries.push({
          id: `vuelta-d${idx + 1}-m${matchIdx}`,
          type: 'interzonal',
          home: e.away,
          away: e.home,
          homeTeamId: e.awayTeamId,
          awayTeamId: e.homeTeamId,
        })
        matchIdx++
      }
    }

    return {
      dateNumber: T - 1 + idx + 1,
      entries: vueltaEntries,
    }
  })

  return [...idaDates, ...vueltaDates]
}

/**
 * Genera fixtures para todas las zonas.
 * Cada zona obtiene su propio round-robin (freeDates e interzonalDates por zona).
 * Requiere que todas las zonas tengan el mismo interzonalDates para emparejar.
 */
export function generateAllFixtures(
  zones: ZoneInput[],
  rounds: 'single' | 'double'
): ZoneFixture[] {
  return zones.map((zone) => {
    const freeDates = zone.freeDates ?? 0
    const interzonalDates = zone.interzonalDates ?? 0
    const dates = generateFixture(
      zone.teams,
      freeDates,
      interzonalDates,
      rounds
    )
    const stats = calculateFixtureStats(
      dates,
      zone.teams,
      freeDates,
      interzonalDates,
      rounds
    )
    return {
      zoneId: zone.id,
      zoneName: zone.name,
      dates,
      stats,
    }
  })
}

/**
 * Fusiona los fixtures de cada zona en un único calendario y resuelve
 * los partidos INTERZONAL emparejando equipos de distintas zonas.
 * Para cada fecha: partidos regulares/libre de cada zona + partidos
 * interzonales (equipo zona A vs equipo zona B, etc.).
 */
export function mergeAndResolveInterzonal(
  zoneFixtures: ZoneFixture[]
): FixtureDate[] {
  if (zoneFixtures.length === 0) return []

  const maxDates = Math.max(
    ...zoneFixtures.map((zf) => zf.dates.length)
  )
  type Slot = { teamId: number; teamName: string; isHome: boolean }

  const datesByNumber = new Map<
    number,
    {
      regulars: FixtureEntry[]
      libres: FixtureEntry[]
      /** Slots agrupados por zona para emparejar zona0 con zona1, etc. */
      interzonalSlotsByZone: Slot[][]
    }
  >()

  for (let d = 1; d <= maxDates; d++) {
    datesByNumber.set(d, {
      regulars: [],
      libres: [],
      interzonalSlotsByZone: zoneFixtures.map(() => []),
    })
  }

  for (let zi = 0; zi < zoneFixtures.length; zi++) {
    const zf = zoneFixtures[zi]
    for (const fd of zf.dates) {
      const bucket = datesByNumber.get(fd.dateNumber)
      if (!bucket) continue

      for (const entry of fd.entries) {
        if (entry.type === 'regular') {
          bucket.regulars.push(entry)
        } else if (entry.type === 'libre') {
          bucket.libres.push(entry)
        } else if (entry.type === 'interzonal') {
          const teamId = entry.homeTeamId ?? entry.awayTeamId
          const teamName = entry.home !== 'INTERZONAL' ? entry.home : entry.away
          const isHome = entry.homeTeamId != null
          if (teamId != null) {
            bucket.interzonalSlotsByZone[zi].push({ teamId, teamName, isHome })
          }
        }
      }
    }
  }

  const result: FixtureDate[] = []
  for (let d = 1; d <= maxDates; d++) {
    const bucket = datesByNumber.get(d)!
    const entries: FixtureEntry[] = [...bucket.regulars, ...bucket.libres]

    const byZone = bucket.interzonalSlotsByZone
    const minSlots = Math.min(...byZone.map((s) => s.length))

    if (byZone.length === 2) {
      for (let i = 0; i < minSlots; i++) {
        const a = byZone[0][i]
        const b = byZone[1][i]
        if (a && b) {
          const home = i % 2 === 0 ? a : b
          const away = home === a ? b : a
          entries.push({
            id: `interzonal-d${d}-${i}`,
            type: 'interzonal',
            home: home.teamName,
            away: away.teamName,
            homeTeamId: home.teamId,
            awayTeamId: away.teamId,
          })
        }
      }
    } else if (byZone.length === 3 && minSlots >= 2) {
      const a = byZone[0][0]
      const b = byZone[1][0]
      if (a && b)
        entries.push({
          id: `interzonal-d${d}-01`,
          type: 'interzonal',
          home: a.teamName,
          away: b.teamName,
          homeTeamId: a.teamId,
          awayTeamId: b.teamId,
        })
      const c = byZone[0][1]
      const dZ2 = byZone[2][0]
      if (c && dZ2)
        entries.push({
          id: `interzonal-d${d}-02`,
          type: 'interzonal',
          home: c.teamName,
          away: dZ2.teamName,
          homeTeamId: c.teamId,
          awayTeamId: dZ2.teamId,
        })
      const e = byZone[1][1]
      const f = byZone[2][1]
      if (e && f)
        entries.push({
          id: `interzonal-d${d}-12`,
          type: 'interzonal',
          home: e.teamName,
          away: f.teamName,
          homeTeamId: e.teamId,
          awayTeamId: f.teamId,
        })
    } else if (byZone.length >= 3) {
      for (let i = 0; i < minSlots; i++) {
        const slotFromEachZone = byZone.map((s) => s[i]).filter(Boolean)
        for (let j = 0; j + 1 < slotFromEachZone.length; j += 2) {
          const a = slotFromEachZone[j]
          const b = slotFromEachZone[j + 1]
          if (a && b) {
            const home = j % 2 === 0 ? a : b
            const away = home === a ? b : a
            entries.push({
              id: `interzonal-d${d}-${i}-${j}`,
              type: 'interzonal',
              home: home.teamName,
              away: away.teamName,
              homeTeamId: home.teamId,
              awayTeamId: away.teamId,
            })
          }
        }
      }
    }

    if (entries.length > 0) {
      result.push({ dateNumber: d, entries })
    }
  }

  return result
}

// ─── Funciones públicas: estadísticas ───────────────────────────────────────

/** Calcula estadísticas a partir de un fixture (posiblemente editado). */
export function calculateFixtureStats(
  dates: FixtureDate[],
  teams: { id: number; name: string }[],
  freeDates: number,
  interzonalDates: number,
  rounds: 'single' | 'double'
): FixtureStats {
  const N = teams.length

  // Acumular conteos por equipo
  const home: Record<number, number> = {}
  const away: Record<number, number> = {}
  const libre: Record<number, number> = {}
  const interzonal: Record<number, number> = {}

  for (const t of teams) {
    home[t.id] = 0
    away[t.id] = 0
    libre[t.id] = 0
    interzonal[t.id] = 0
  }

  for (const date of dates) {
    for (const entry of date.entries) {
      if (entry.type === 'regular') {
        if (entry.homeTeamId != null) home[entry.homeTeamId]++
        if (entry.awayTeamId != null) away[entry.awayTeamId]++
      } else if (entry.type === 'libre') {
        if (entry.homeTeamId != null) libre[entry.homeTeamId]++
      } else if (entry.type === 'interzonal') {
        const tid = entry.homeTeamId ?? entry.awayTeamId
        if (tid != null) interzonal[tid]++
      }
    }
  }

  const teamStats: TeamStats[] = teams.map((t) => ({
    teamId: t.id,
    teamName: t.name,
    homeGames: home[t.id],
    awayGames: away[t.id],
    libreDates: libre[t.id],
    interzonalDates: interzonal[t.id],
  }))

  // Calcular valores esperados
  const regularPerTeam = N - 1
  const expectedHome =
    rounds === 'double' ? regularPerTeam : Math.floor(regularPerTeam / 2)
  const expectedAway =
    rounds === 'double' ? regularPerTeam : Math.ceil(regularPerTeam / 2)

  // Detectar excepciones
  const exceptions: string[] = []

  for (const ts of teamStats) {
    if (rounds === 'single') {
      const totalRegular = ts.homeGames + ts.awayGames
      if (totalRegular !== regularPerTeam) {
        exceptions.push(
          `${ts.teamName} juega ${totalRegular} partidos regulares en vez de ${regularPerTeam}`
        )
      }
      if (
        ts.homeGames !== expectedHome &&
        ts.homeGames !== expectedAway
      ) {
        exceptions.push(
          `${ts.teamName} juega ${ts.homeGames} de local (esperado ~${expectedHome})`
        )
      }
    } else {
      if (ts.homeGames !== expectedHome) {
        exceptions.push(
          `${ts.teamName} juega ${ts.homeGames} de local en vez de ${expectedHome}`
        )
      }
      if (ts.awayGames !== expectedAway) {
        exceptions.push(
          `${ts.teamName} juega ${ts.awayGames} de visitante en vez de ${expectedAway}`
        )
      }
    }
    if (ts.libreDates !== freeDates) {
      exceptions.push(
        `${ts.teamName} queda libre ${ts.libreDates} fecha(s) en vez de ${freeDates}`
      )
    }
    if (ts.interzonalDates !== interzonalDates) {
      exceptions.push(
        `${ts.teamName} juega ${ts.interzonalDates} interzonal(es) en vez de ${interzonalDates}`
      )
    }
  }

  return {
    totalDates: dates.length,
    teamStats,
    expectedHomeGames: expectedHome,
    expectedAwayGames: expectedAway,
    exceptions,
  }
}

// ─── Implementación interna: Circle method ──────────────────────────────────

function circleMethod(
  participants: Participant[],
  T: number
): FixtureDate[] {
  const dates: FixtureDate[] = []
  const fixed = participants[0]
  const rotating = participants.slice(1)

  for (let round = 0; round < T - 1; round++) {
    const regularEntries: FixtureEntry[] = []
    const interzonalEntries: FixtureEntry[] = []
    const libreEntries: FixtureEntry[] = []

    let matchIdx = 0

    // Emparejar: (fixed, último) y luego (i-ésimo, simétrico)
    const pairings: [Participant, Participant, boolean][] = []

    // Primera pareja: fixed vs último del arreglo rotante
    pairings.push([fixed, rotating[T - 2], round % 2 === 0])

    // Resto de parejas
    for (let i = 0; i < (T - 2) / 2; i++) {
      pairings.push([rotating[i], rotating[T - 3 - i], i % 2 === 0])
    }

    for (const [a, b, aIsHome] of pairings) {
      // Descartar fantasma vs fantasma
      if (a.type !== 'team' && b.type !== 'team') continue

      const homeP = aIsHome ? a : b
      const awayP = aIsHome ? b : a
      const entry = buildEntry(homeP, awayP, round + 1, matchIdx)
      matchIdx++

      if (entry.type === 'regular') regularEntries.push(entry)
      else if (entry.type === 'interzonal') interzonalEntries.push(entry)
      else libreEntries.push(entry)
    }

    dates.push({
      dateNumber: round + 1,
      entries: [...regularEntries, ...interzonalEntries, ...libreEntries],
    })

    // Rotar a la derecha: el último pasa al inicio
    rotating.unshift(rotating.pop()!)
  }

  return dates
}

function buildEntry(
  homeP: Participant,
  awayP: Participant,
  dateNum: number,
  matchIdx: number
): FixtureEntry {
  const id = `ida-d${dateNum}-m${matchIdx}`

  // LIBRE: equipo siempre a la izquierda
  if (homeP.type === 'libre' || awayP.type === 'libre') {
    const realTeam = homeP.type === 'team' ? homeP : awayP
    return {
      id,
      type: 'libre',
      home: realTeam.name,
      away: 'LIBRE',
      homeTeamId: realTeam.teamId,
      awayTeamId: null,
    }
  }

  // INTERZONAL: respetar posición del round-robin
  if (homeP.type === 'interzonal' || awayP.type === 'interzonal') {
    return {
      id,
      type: 'interzonal',
      home: homeP.type === 'team' ? homeP.name : 'INTERZONAL',
      away: awayP.type === 'team' ? awayP.name : 'INTERZONAL',
      homeTeamId: homeP.type === 'team' ? homeP.teamId : null,
      awayTeamId: awayP.type === 'team' ? awayP.teamId : null,
    }
  }

  // Regular
  return {
    id,
    type: 'regular',
    home: homeP.name,
    away: awayP.name,
    homeTeamId: homeP.teamId,
    awayTeamId: awayP.teamId,
  }
}

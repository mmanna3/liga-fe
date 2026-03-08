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

type TipoParticipante = 'team' | 'libre' | 'interzonal'

interface Participante {
  type: TipoParticipante
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

/** Devuelve true si n es potencia de 2 (2, 4, 8, 16, ...) */
export function isPowerOf2(n: number): boolean {
  return n >= 2 && n > 0 && (n & (n - 1)) === 0
}

/** Devuelve true si N + fechasLibres + fechasInterzonales es par (para una zona) */
export function esConfiguracionValida(
  cantidadEquipos: number,
  fechasLibres: number,
  fechasInterzonales: number
): boolean {
  const T = cantidadEquipos + fechasLibres + fechasInterzonales
  return T >= 2 && T % 2 === 0
}

/**
 * Devuelve true si N + fechasLibres + fechasInterzonales es potencia de 2 (para eliminación directa).
 * La llave requiere 2, 4, 8, 16, ... participantes.
 */
export function esValidoParaEliminacion(
  cantidadEquipos: number,
  fechasLibres: number,
  fechasInterzonales: number
): boolean {
  const T = cantidadEquipos + fechasLibres + fechasInterzonales
  return isPowerOf2(T)
}

/** Valida cada zona individualmente (fechasLibres y fechasInterzonales por zona) */
export function validarZonas(
  zonas: ZoneInput[],
  modo: 'all-vs-all' | 'elimination' = 'all-vs-all'
): ZoneValidation[] {
  return zonas.map((zona) => {
    const fechasLibres = zona.freeDates ?? 0
    const fechasInterzonales = zona.interzonalDates ?? 0
    const T = zona.teams.length + fechasLibres + fechasInterzonales
    const isValid =
      modo === 'elimination' ? isPowerOf2(T) : T >= 2 && T % 2 === 0
    return {
      zoneId: zona.id,
      zoneName: zona.name,
      teamCount: zona.teams.length,
      totalParticipants: T,
      isValid
    }
  })
}

/**
 * Valida que el emparejamiento interzonal sea posible.
 * Para que cada equipo tenga rival en cada fecha, TODAS las zonas deben tener
 * la misma cantidad de fechasInterzonales (o todas 0).
 */
export function validarEmparejamientoInterzonal(
  zonas: ZoneInput[]
): InterzonalPairingValidation {
  if (zonas.length <= 1) {
    return { isValid: true, message: '' }
  }

  const valores = zonas.map((z) => z.interzonalDates ?? 0)
  const conInterzonal = valores.filter((v) => v > 0)

  if (conInterzonal.length === 0) {
    return { isValid: true, message: '' }
  }

  const primero = conInterzonal[0]
  const todosIguales = conInterzonal.every((v) => v === primero)

  if (!todosIguales) {
    const porZona = zonas
      .filter((z) => (z.interzonalDates ?? 0) > 0)
      .map((z) => `${z.name}: ${z.interzonalDates}`)
      .join(', ')
    return {
      isValid: false,
      message: `Todas las zonas deben tener la misma cantidad de fechas interzonales por equipo para que cada equipo tenga rival en cada fecha. Actual: ${porZona}`
    }
  }

  const zonasConCero = zonas.filter((z) => (z.interzonalDates ?? 0) === 0)
  if (zonasConCero.length > 0) {
    return {
      isValid: false,
      message: `Las zonas ${zonasConCero.map((z) => z.name).join(', ')} tienen 0 interzonal mientras otras tienen ${primero}. Todas deben ser iguales.`
    }
  }

  if (zonas.length >= 3 && primero % 2 !== 0) {
    return {
      isValid: false,
      message: `Con 3 o más zonas, la cantidad interzonal debe ser par para que cada equipo tenga rival en cada fecha (actual: ${primero}).`
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
  const fechasIda = T - 1
  return rounds === 'double' ? fechasIda * 2 : fechasIda
}

/** Cantidad de jornadas cuando hay zonas: cada zona tiene su propio cálculo. Retorna el máximo. */
export function calculateTotalDatesForZones(
  zonas: ZoneInput[],
  vueltas: 'single' | 'double'
): number {
  if (zonas.length === 0) return 0
  const fechasPorZona = zonas.map((z) =>
    calculateTotalDates(
      z.teams.length,
      z.freeDates ?? 0,
      z.interzonalDates ?? 0,
      vueltas
    )
  )
  return Math.max(...fechasPorZona)
}

// ─── Funciones públicas: generación ─────────────────────────────────────────

/**
 * Genera el fixture de una sola zona.
 *
 * @throws si N + fechasLibres + fechasInterzonales es impar
 */
export function generarFixture(
  equipos: { id: number; name: string }[],
  fechasLibres: number,
  fechasInterzonales: number,
  vueltas: 'single' | 'double'
): FixtureDate[] {
  const N = equipos.length
  const T = N + fechasLibres + fechasInterzonales

  if (T < 2) return []

  if (T % 2 !== 0) {
    throw new Error(
      `La cantidad total de participantes (${T}) debe ser par. ` +
        `Equipos: ${N}, Libre: ${fechasLibres}, Interzonal: ${fechasInterzonales}`
    )
  }

  // Mezclar equipos reales
  const mezclados = [...equipos].sort(() => Math.random() - 0.5)

  // Ordenar participantes: equipos primero, fantasmas al final (rotación completa).
  const equipoFijo = mezclados[0]
  const otrosEquipos = mezclados.slice(1)
  const fantasmas: Participante[] = [
    ...Array.from({ length: fechasLibres }, () => ({
      type: 'libre' as const,
      teamId: null as number | null,
      name: 'LIBRE'
    })),
    ...Array.from({ length: fechasInterzonales }, () => ({
      type: 'interzonal' as const,
      teamId: null as number | null,
      name: 'INTERZONAL'
    }))
  ]
  const participantes: Participante[] = [
    { type: 'team', teamId: equipoFijo.id, name: equipoFijo.name },
    ...otrosEquipos.map((t) => ({
      type: 'team' as const,
      teamId: t.id,
      name: t.name
    })),
    ...fantasmas
  ]

  const fechasIda = metodoCirculo(participantes, T)

  if (vueltas === 'single') return fechasIda

  // Vuelta: mismos partidos que ida (regular, libre, interzonal), con local/visitante invertidos
  const fechasVuelta: FixtureDate[] = fechasIda.map((fechaIda, idx) => {
    const entradasVuelta: FixtureEntry[] = []
    let matchIdx = 0

    for (const e of fechaIda.entries) {
      if (e.type === 'regular') {
        entradasVuelta.push({
          id: `vuelta-d${idx + 1}-m${matchIdx}`,
          type: 'regular',
          home: e.away,
          away: e.home,
          homeTeamId: e.awayTeamId,
          awayTeamId: e.homeTeamId
        })
        matchIdx++
      } else if (e.type === 'libre') {
        entradasVuelta.push({
          id: `vuelta-d${idx + 1}-m${matchIdx}`,
          type: 'libre',
          home: e.home,
          away: e.away,
          homeTeamId: e.homeTeamId,
          awayTeamId: e.awayTeamId
        })
        matchIdx++
      } else if (e.type === 'interzonal') {
        entradasVuelta.push({
          id: `vuelta-d${idx + 1}-m${matchIdx}`,
          type: 'interzonal',
          home: e.away,
          away: e.home,
          homeTeamId: e.awayTeamId,
          awayTeamId: e.homeTeamId
        })
        matchIdx++
      }
    }

    return {
      dateNumber: T - 1 + idx + 1,
      entries: entradasVuelta
    }
  })

  return [...fechasIda, ...fechasVuelta]
}

/**
 * Genera fixtures para todas las zonas.
 * Cada zona obtiene su propio round-robin (fechasLibres y fechasInterzonales por zona).
 * Requiere que todas las zonas tengan el mismo fechasInterzonales para emparejar.
 */
export function generarTodosLosFixtures(
  zonas: ZoneInput[],
  vueltas: 'single' | 'double'
): ZoneFixture[] {
  return zonas.map((zona) => {
    const fechasLibres = zona.freeDates ?? 0
    const fechasInterzonales = zona.interzonalDates ?? 0
    const fechas = generarFixture(
      zona.teams,
      fechasLibres,
      fechasInterzonales,
      vueltas
    )
    const estadisticas = calculateFixtureStats(
      fechas,
      zona.teams,
      fechasLibres,
      fechasInterzonales,
      vueltas
    )
    return {
      zoneId: zona.id,
      zoneName: zona.name,
      dates: fechas,
      stats: estadisticas
    }
  })
}

/**
 * Fusiona los fixtures de cada zona en un único calendario y resuelve
 * los partidos INTERZONAL emparejando equipos de distintas zonas.
 * Para cada fecha: partidos regulares/libre de cada zona + partidos
 * interzonales (equipo zona A vs equipo zona B, etc.).
 */
export function fusionarYResolverInterzonal(
  fixturesPorZona: ZoneFixture[]
): FixtureDate[] {
  if (fixturesPorZona.length === 0) return []

  const maxFechas = Math.max(...fixturesPorZona.map((zf) => zf.dates.length))
  type Slot = { teamId: number; teamName: string; isHome: boolean }

  const fechasPorNumero = new Map<
    number,
    {
      regulares: FixtureEntry[]
      libres: FixtureEntry[]
      /** Slots agrupados por zona para emparejar zona0 con zona1, etc. */
      slotInterzonalesPorZona: Slot[][]
    }
  >()

  for (let d = 1; d <= maxFechas; d++) {
    fechasPorNumero.set(d, {
      regulares: [],
      libres: [],
      slotInterzonalesPorZona: fixturesPorZona.map(() => [])
    })
  }

  for (let zi = 0; zi < fixturesPorZona.length; zi++) {
    const zf = fixturesPorZona[zi]
    for (const fd of zf.dates) {
      const bucket = fechasPorNumero.get(fd.dateNumber)
      if (!bucket) continue

      for (const entrada of fd.entries) {
        if (entrada.type === 'regular') {
          bucket.regulares.push(entrada)
        } else if (entrada.type === 'libre') {
          bucket.libres.push(entrada)
        } else if (entrada.type === 'interzonal') {
          const teamId = entrada.homeTeamId ?? entrada.awayTeamId
          const teamName =
            entrada.home !== 'INTERZONAL' ? entrada.home : entrada.away
          const isHome = entrada.homeTeamId != null
          if (teamId != null) {
            bucket.slotInterzonalesPorZona[zi].push({
              teamId,
              teamName,
              isHome
            })
          }
        }
      }
    }
  }

  const resultado: FixtureDate[] = []
  for (let d = 1; d <= maxFechas; d++) {
    const bucket = fechasPorNumero.get(d)!
    const entradas: FixtureEntry[] = [...bucket.regulares, ...bucket.libres]

    const porZona = bucket.slotInterzonalesPorZona
    const minSlots = Math.min(...porZona.map((s) => s.length))

    if (porZona.length === 2) {
      for (let i = 0; i < minSlots; i++) {
        const a = porZona[0][i]
        const b = porZona[1][i]
        if (a && b) {
          const local = i % 2 === 0 ? a : b
          const visitante = local === a ? b : a
          entradas.push({
            id: `interzonal-d${d}-${i}`,
            type: 'interzonal',
            home: local.teamName,
            away: visitante.teamName,
            homeTeamId: local.teamId,
            awayTeamId: visitante.teamId
          })
        }
      }
    } else if (porZona.length === 3 && minSlots >= 2) {
      const a = porZona[0][0]
      const b = porZona[1][0]
      if (a && b)
        entradas.push({
          id: `interzonal-d${d}-01`,
          type: 'interzonal',
          home: a.teamName,
          away: b.teamName,
          homeTeamId: a.teamId,
          awayTeamId: b.teamId
        })
      const c = porZona[0][1]
      const dZ2 = porZona[2][0]
      if (c && dZ2)
        entradas.push({
          id: `interzonal-d${d}-02`,
          type: 'interzonal',
          home: c.teamName,
          away: dZ2.teamName,
          homeTeamId: c.teamId,
          awayTeamId: dZ2.teamId
        })
      const e = porZona[1][1]
      const f = porZona[2][1]
      if (e && f)
        entradas.push({
          id: `interzonal-d${d}-12`,
          type: 'interzonal',
          home: e.teamName,
          away: f.teamName,
          homeTeamId: e.teamId,
          awayTeamId: f.teamId
        })
    } else if (porZona.length >= 3) {
      for (let i = 0; i < minSlots; i++) {
        const slotsDeCadaZona = porZona.map((s) => s[i]).filter(Boolean)
        for (let j = 0; j + 1 < slotsDeCadaZona.length; j += 2) {
          const a = slotsDeCadaZona[j]
          const b = slotsDeCadaZona[j + 1]
          if (a && b) {
            const local = j % 2 === 0 ? a : b
            const visitante = local === a ? b : a
            entradas.push({
              id: `interzonal-d${d}-${i}-${j}`,
              type: 'interzonal',
              home: local.teamName,
              away: visitante.teamName,
              homeTeamId: local.teamId,
              awayTeamId: visitante.teamId
            })
          }
        }
      }
    }

    if (entradas.length > 0) {
      resultado.push({ dateNumber: d, entries: entradas })
    }
  }

  return resultado
}

// ─── Funciones públicas: estadísticas ───────────────────────────────────────

/** Calcula estadísticas a partir de un fixture (posiblemente editado). */
export function calculateFixtureStats(
  fechas: FixtureDate[],
  equipos: { id: number; name: string }[],
  fechasLibres: number,
  fechasInterzonales: number,
  vueltas: 'single' | 'double'
): FixtureStats {
  const N = equipos.length

  // Acumular conteos por equipo
  const local: Record<number, number> = {}
  const visitante: Record<number, number> = {}
  const libre: Record<number, number> = {}
  const interzonal: Record<number, number> = {}

  for (const t of equipos) {
    local[t.id] = 0
    visitante[t.id] = 0
    libre[t.id] = 0
    interzonal[t.id] = 0
  }

  for (const fecha of fechas) {
    for (const entrada of fecha.entries) {
      if (entrada.type === 'regular') {
        if (entrada.homeTeamId != null) local[entrada.homeTeamId]++
        if (entrada.awayTeamId != null) visitante[entrada.awayTeamId]++
      } else if (entrada.type === 'libre') {
        if (entrada.homeTeamId != null) libre[entrada.homeTeamId]++
      } else if (entrada.type === 'interzonal') {
        const tid = entrada.homeTeamId ?? entrada.awayTeamId
        if (tid != null) interzonal[tid]++
      }
    }
  }

  const teamStats: TeamStats[] = equipos.map((t) => ({
    teamId: t.id,
    teamName: t.name,
    homeGames: local[t.id],
    awayGames: visitante[t.id],
    libreDates: libre[t.id],
    interzonalDates: interzonal[t.id]
  }))

  // Calcular valores esperados
  const regularPorEquipo = N - 1
  const expectedHome =
    vueltas === 'double' ? regularPorEquipo : Math.floor(regularPorEquipo / 2)
  const expectedAway =
    vueltas === 'double' ? regularPorEquipo : Math.ceil(regularPorEquipo / 2)

  // Detectar excepciones
  const excepciones: string[] = []

  for (const ts of teamStats) {
    if (vueltas === 'single') {
      const totalRegular = ts.homeGames + ts.awayGames
      if (totalRegular !== regularPorEquipo) {
        excepciones.push(
          `${ts.teamName} juega ${totalRegular} partidos regulares en vez de ${regularPorEquipo}`
        )
      }
      if (ts.homeGames !== expectedHome && ts.homeGames !== expectedAway) {
        excepciones.push(
          `${ts.teamName} juega ${ts.homeGames} de local (esperado ~${expectedHome})`
        )
      }
    } else {
      if (ts.homeGames !== expectedHome) {
        excepciones.push(
          `${ts.teamName} juega ${ts.homeGames} de local en vez de ${expectedHome}`
        )
      }
      if (ts.awayGames !== expectedAway) {
        excepciones.push(
          `${ts.teamName} juega ${ts.awayGames} de visitante en vez de ${expectedAway}`
        )
      }
    }
    if (ts.libreDates !== fechasLibres) {
      excepciones.push(
        `${ts.teamName} queda libre ${ts.libreDates} fecha(s) en vez de ${fechasLibres}`
      )
    }
    if (ts.interzonalDates !== fechasInterzonales) {
      excepciones.push(
        `${ts.teamName} juega ${ts.interzonalDates} interzonal(es) en vez de ${fechasInterzonales}`
      )
    }
  }

  return {
    totalDates: fechas.length,
    teamStats,
    expectedHomeGames: expectedHome,
    expectedAwayGames: expectedAway,
    exceptions: excepciones
  }
}

// ─── Implementación interna: Circle method ──────────────────────────────────

function metodoCirculo(
  participantes: Participante[],
  T: number
): FixtureDate[] {
  const fechas: FixtureDate[] = []
  const fijo = participantes[0]
  const rotantes = participantes.slice(1)

  for (let ronda = 0; ronda < T - 1; ronda++) {
    const entradasRegulares: FixtureEntry[] = []
    const entradasInterzonales: FixtureEntry[] = []
    const entradasLibres: FixtureEntry[] = []

    let matchIdx = 0

    // Emparejar: (fijo, último) y luego (i-ésimo, simétrico)
    const emparejamientos: [Participante, Participante, boolean][] = []

    // Primera pareja: fijo vs último del arreglo rotante
    emparejamientos.push([fijo, rotantes[T - 2], ronda % 2 === 0])

    // Resto de parejas
    for (let i = 0; i < (T - 2) / 2; i++) {
      emparejamientos.push([rotantes[i], rotantes[T - 3 - i], i % 2 === 0])
    }

    for (const [a, b, aEsLocal] of emparejamientos) {
      // Descartar fantasma vs fantasma
      if (a.type !== 'team' && b.type !== 'team') continue

      const localP = aEsLocal ? a : b
      const visitanteP = aEsLocal ? b : a
      const entrada = construirEntrada(localP, visitanteP, ronda + 1, matchIdx)
      matchIdx++

      if (entrada.type === 'regular') entradasRegulares.push(entrada)
      else if (entrada.type === 'interzonal') entradasInterzonales.push(entrada)
      else entradasLibres.push(entrada)
    }

    fechas.push({
      dateNumber: ronda + 1,
      entries: [
        ...entradasRegulares,
        ...entradasInterzonales,
        ...entradasLibres
      ]
    })

    // Rotar a la derecha: el último pasa al inicio
    rotantes.unshift(rotantes.pop()!)
  }

  return fechas
}

function construirEntrada(
  localP: Participante,
  visitanteP: Participante,
  numFecha: number,
  matchIdx: number
): FixtureEntry {
  const id = `ida-d${numFecha}-m${matchIdx}`

  // LIBRE: equipo siempre a la izquierda
  if (localP.type === 'libre' || visitanteP.type === 'libre') {
    const equipoReal = localP.type === 'team' ? localP : visitanteP
    return {
      id,
      type: 'libre',
      home: equipoReal.name,
      away: 'LIBRE',
      homeTeamId: equipoReal.teamId,
      awayTeamId: null
    }
  }

  // INTERZONAL: respetar posición del round-robin
  if (localP.type === 'interzonal' || visitanteP.type === 'interzonal') {
    return {
      id,
      type: 'interzonal',
      home: localP.type === 'team' ? localP.name : 'INTERZONAL',
      away: visitanteP.type === 'team' ? visitanteP.name : 'INTERZONAL',
      homeTeamId: localP.type === 'team' ? localP.teamId : null,
      awayTeamId: visitanteP.type === 'team' ? visitanteP.teamId : null
    }
  }

  // Regular
  return {
    id,
    type: 'regular',
    home: localP.name,
    away: visitanteP.name,
    homeTeamId: localP.teamId,
    awayTeamId: visitanteP.teamId
  }
}

// ─── Aliases de compatibilidad ───────────────────────────────────────────────

/** @deprecated Usar esConfiguracionValida */
export const isValidConfiguration = esConfiguracionValida

/** @deprecated Usar esValidoParaEliminacion */
export const isValidForElimination = esValidoParaEliminacion

/** @deprecated Usar validarZonas */
export const validateZones = validarZonas

/** @deprecated Usar validarEmparejamientoInterzonal */
export const validateInterzonalPairing = validarEmparejamientoInterzonal

/** @deprecated Usar generarFixture */
export const generateFixture = generarFixture

/** @deprecated Usar generarTodosLosFixtures */
export const generateAllFixtures = generarTodosLosFixtures

/** @deprecated Usar fusionarYResolverInterzonal */
export const mergeAndResolveInterzonal = fusionarYResolverInterzonal

import type {
  EntradaDeZona,
  EntradaFixture,
  EstadisticasEquipo,
  EstadisticasFixture,
  FechaFixture,
  FixturePorZona,
  Participante
} from './fixture-tipos'

// ─── Generación de fixture ───────────────────────────────────────────────────

/**
 * Genera el fixture de una sola zona mediante round-robin (método círculo).
 *
 * Se agregan `fechasLibres` equipos fantasma "LIBRE" y `fechasInterzonales`
 * equipos fantasma "INTERZONAL" para completar el torneo.
 *
 * @throws si cantidadEquipos + fechasLibres + fechasInterzonales es impar
 */
export function generarFixture(
  equipos: { id: number; nombre: string }[],
  fechasLibres: number,
  fechasInterzonales: number,
  vueltas: 'ida' | 'ida-y-vuelta'
): FechaFixture[] {
  const N = equipos.length
  const T = N + fechasLibres + fechasInterzonales

  if (T < 2) return []

  if (T % 2 !== 0) {
    throw new Error(
      `La cantidad total de participantes (${T}) debe ser par. ` +
        `Equipos: ${N}, Libre: ${fechasLibres}, Interzonal: ${fechasInterzonales}`
    )
  }

  const mezclados = [...equipos].sort(() => Math.random() - 0.5)

  const equipoFijo = mezclados[0]
  const otrosEquipos = mezclados.slice(1)
  const fantasmas: Participante[] = [
    ...Array.from({ length: fechasLibres }, () => ({
      tipo: 'libre' as const,
      idEquipo: null as number | null,
      nombre: 'LIBRE'
    })),
    ...Array.from({ length: fechasInterzonales }, () => ({
      tipo: 'interzonal' as const,
      idEquipo: null as number | null,
      nombre: 'INTERZONAL'
    }))
  ]

  const participantes: Participante[] = [
    { tipo: 'equipo', idEquipo: equipoFijo.id, nombre: equipoFijo.nombre },
    ...otrosEquipos.map((t) => ({
      tipo: 'equipo' as const,
      idEquipo: t.id,
      nombre: t.nombre
    })),
    ...fantasmas
  ]

  const fechasIda = metodoCirculo(participantes, T)

  if (vueltas === 'ida') return fechasIda

  const fechasVuelta: FechaFixture[] = fechasIda.map((fechaIda, idx) => {
    const entradasVuelta: EntradaFixture[] = []
    let matchIdx = 0

    for (const e of fechaIda.entradas) {
      if (e.tipo === 'regular') {
        entradasVuelta.push({
          id: `vuelta-f${idx + 1}-p${matchIdx}`,
          tipo: 'regular',
          local: e.visitante,
          visitante: e.local,
          idEquipoLocal: e.idEquipoVisitante,
          idEquipoVisitante: e.idEquipoLocal
        })
        matchIdx++
      } else if (e.tipo === 'libre') {
        entradasVuelta.push({
          id: `vuelta-f${idx + 1}-p${matchIdx}`,
          tipo: 'libre',
          local: e.local,
          visitante: e.visitante,
          idEquipoLocal: e.idEquipoLocal,
          idEquipoVisitante: e.idEquipoVisitante
        })
        matchIdx++
      } else if (e.tipo === 'interzonal') {
        entradasVuelta.push({
          id: `vuelta-f${idx + 1}-p${matchIdx}`,
          tipo: 'interzonal',
          local: e.visitante,
          visitante: e.local,
          idEquipoLocal: e.idEquipoVisitante,
          idEquipoVisitante: e.idEquipoLocal
        })
        matchIdx++
      }
    }

    return {
      numeroFecha: T - 1 + idx + 1,
      entradas: entradasVuelta
    }
  })

  return [...fechasIda, ...fechasVuelta]
}

/**
 * Genera fixtures para todas las zonas.
 * Cada zona obtiene su propio round-robin independiente.
 */
export function generarTodosLosFixtures(
  zonas: EntradaDeZona[],
  vueltas: 'ida' | 'ida-y-vuelta'
): FixturePorZona[] {
  return zonas.map((zona) => {
    const fechas = generarFixture(
      zona.equipos,
      zona.fechasLibres,
      zona.fechasInterzonales,
      vueltas
    )
    const estadisticas = calcularEstadisticasFixture(
      fechas,
      zona.equipos,
      zona.fechasLibres,
      zona.fechasInterzonales,
      vueltas
    )
    return {
      idZona: zona.id,
      nombreZona: zona.nombre,
      fechas,
      estadisticas
    }
  })
}

/**
 * Fusiona los fixtures de cada zona en un único calendario y resuelve
 * los partidos INTERZONAL emparejando equipos de distintas zonas.
 */
export function fusionarYResolverInterzonal(
  fixturesPorZona: FixturePorZona[]
): FechaFixture[] {
  if (fixturesPorZona.length === 0) return []

  const maxFechas = Math.max(...fixturesPorZona.map((zf) => zf.fechas.length))
  type Slot = { idEquipo: number; nombre: string; esLocal: boolean }

  const fechasPorNumero = new Map<
    number,
    {
      regulares: EntradaFixture[]
      libres: EntradaFixture[]
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
    for (const fd of zf.fechas) {
      const bucket = fechasPorNumero.get(fd.numeroFecha)
      if (!bucket) continue

      for (const entrada of fd.entradas) {
        if (entrada.tipo === 'regular') {
          bucket.regulares.push(entrada)
        } else if (entrada.tipo === 'libre') {
          bucket.libres.push(entrada)
        } else if (entrada.tipo === 'interzonal') {
          const idEquipo = entrada.idEquipoLocal ?? entrada.idEquipoVisitante
          const nombre =
            entrada.local !== 'INTERZONAL' ? entrada.local : entrada.visitante
          const esLocal = entrada.idEquipoLocal != null
          if (idEquipo != null) {
            bucket.slotInterzonalesPorZona[zi].push({
              idEquipo,
              nombre,
              esLocal
            })
          }
        }
      }
    }
  }

  const resultado: FechaFixture[] = []

  for (let d = 1; d <= maxFechas; d++) {
    const bucket = fechasPorNumero.get(d)!
    const entradas: EntradaFixture[] = [...bucket.regulares, ...bucket.libres]

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
            id: `interzonal-f${d}-${i}`,
            tipo: 'interzonal',
            local: local.nombre,
            visitante: visitante.nombre,
            idEquipoLocal: local.idEquipo,
            idEquipoVisitante: visitante.idEquipo
          })
        }
      }
    } else if (porZona.length === 3 && minSlots >= 2) {
      // Con 3 zonas, se necesitan al menos 2 slots interzonales por zona (valor par).
      // Emparejamiento: zona0[0] vs zona1[0], zona0[1] vs zona2[0], zona1[1] vs zona2[1]
      const [z0, z1, z2] = porZona
      const pares: [Slot | undefined, Slot | undefined, string][] = [
        [z0[0], z1[0], '01'],
        [z0[1], z2[0], '02'],
        [z1[1], z2[1], '12']
      ]
      for (const [a, b, sufijo] of pares) {
        if (a && b) {
          entradas.push({
            id: `interzonal-f${d}-${sufijo}`,
            tipo: 'interzonal',
            local: a.nombre,
            visitante: b.nombre,
            idEquipoLocal: a.idEquipo,
            idEquipoVisitante: b.idEquipo
          })
        }
      }
    } else if (porZona.length >= 3) {
      for (let i = 0; i < minSlots; i++) {
        const slots = porZona.map((s) => s[i]).filter(Boolean)
        for (let j = 0; j + 1 < slots.length; j += 2) {
          const a = slots[j]
          const b = slots[j + 1]
          if (a && b) {
            const local = j % 2 === 0 ? a : b
            const visitante = local === a ? b : a
            entradas.push({
              id: `interzonal-f${d}-${i}-${j}`,
              tipo: 'interzonal',
              local: local.nombre,
              visitante: visitante.nombre,
              idEquipoLocal: local.idEquipo,
              idEquipoVisitante: visitante.idEquipo
            })
          }
        }
      }
    }

    if (entradas.length > 0) {
      resultado.push({ numeroFecha: d, entradas })
    }
  }

  return resultado
}

// ─── Estadísticas ────────────────────────────────────────────────────────────

/** Calcula estadísticas a partir de un fixture (posiblemente editado). */
export function calcularEstadisticasFixture(
  fechas: FechaFixture[],
  equipos: { id: number; nombre: string }[],
  fechasLibres: number,
  fechasInterzonales: number,
  vueltas: 'ida' | 'ida-y-vuelta'
): EstadisticasFixture {
  const local: Record<number, number> = {}
  const visitante: Record<number, number> = {}
  const libre: Record<number, number> = {}
  const interzonal: Record<number, number> = {}
  const encuentrosPorPar: Record<string, number> = {}

  for (const t of equipos) {
    local[t.id] = 0
    visitante[t.id] = 0
    libre[t.id] = 0
    interzonal[t.id] = 0
  }

  for (const fecha of fechas) {
    for (const entrada of fecha.entradas) {
      if (entrada.tipo === 'regular') {
        if (entrada.idEquipoLocal != null) local[entrada.idEquipoLocal]++
        if (entrada.idEquipoVisitante != null)
          visitante[entrada.idEquipoVisitante]++
        if (
          entrada.idEquipoLocal != null &&
          entrada.idEquipoVisitante != null
        ) {
          const clave = [entrada.idEquipoLocal, entrada.idEquipoVisitante]
            .sort((a, b) => a - b)
            .join('-')
          encuentrosPorPar[clave] = (encuentrosPorPar[clave] ?? 0) + 1
        }
      } else if (entrada.tipo === 'libre') {
        if (entrada.idEquipoLocal != null) libre[entrada.idEquipoLocal]++
      } else if (entrada.tipo === 'interzonal') {
        const id = entrada.idEquipoLocal ?? entrada.idEquipoVisitante
        if (id != null) interzonal[id]++
      }
    }
  }

  const estadisticasPorEquipo: EstadisticasEquipo[] = equipos.map((t) => ({
    idEquipo: t.id,
    nombreEquipo: t.nombre,
    partidosDeLocal: local[t.id],
    partidosDeVisitante: visitante[t.id],
    fechasLibre: libre[t.id],
    fechasInterzonal: interzonal[t.id]
  }))

  const encuentrosEsperados = vueltas === 'ida-y-vuelta' ? 2 : 1
  const regularPorEquipo = equipos.length - 1
  const localEsperado =
    vueltas === 'ida-y-vuelta'
      ? regularPorEquipo
      : Math.floor(regularPorEquipo / 2)
  const visitanteEsperado =
    vueltas === 'ida-y-vuelta'
      ? regularPorEquipo
      : Math.ceil(regularPorEquipo / 2)
  const excEncuentros: string[] = []
  const excLocalVisitante: string[] = []
  const excJornadasLibres: string[] = []
  const excJornadasInterzonales: string[] = []

  for (let i = 0; i < equipos.length; i++) {
    for (let j = i + 1; j < equipos.length; j++) {
      const [a, b] = [equipos[i].id, equipos[j].id].sort((x, y) => x - y)
      const clave = `${a}-${b}`
      const encuentros = encuentrosPorPar[clave] ?? 0
      if (encuentros !== encuentrosEsperados) {
        excEncuentros.push(
          `${equipos[i].nombre} vs ${equipos[j].nombre}: ${encuentros} ${encuentros === 1 ? 'encuentro' : 'encuentros'} (esperado ${encuentrosEsperados})`
        )
      }
    }
  }

  for (const est of estadisticasPorEquipo) {
    if (vueltas === 'ida-y-vuelta') {
      if (est.partidosDeLocal !== localEsperado) {
        excLocalVisitante.push(
          `${est.nombreEquipo} juega ${est.partidosDeLocal} de local en vez de ${localEsperado}`
        )
      }
      if (est.partidosDeVisitante !== visitanteEsperado) {
        excLocalVisitante.push(
          `${est.nombreEquipo} juega ${est.partidosDeVisitante} de visitante en vez de ${visitanteEsperado}`
        )
      }
    } else {
      if (
        est.partidosDeLocal !== localEsperado &&
        est.partidosDeLocal !== visitanteEsperado
      ) {
        excLocalVisitante.push(
          `${est.nombreEquipo} juega ${est.partidosDeLocal} de local (esperado ~${localEsperado})`
        )
      }
    }
    if (est.fechasLibre !== fechasLibres) {
      excJornadasLibres.push(
        `${est.nombreEquipo} queda libre ${est.fechasLibre} fecha(s) en vez de ${fechasLibres}`
      )
    }
    if (est.fechasInterzonal !== fechasInterzonales) {
      excJornadasInterzonales.push(
        `${est.nombreEquipo} juega ${est.fechasInterzonal} interzonal(es) en vez de ${fechasInterzonales}`
      )
    }
  }

  return {
    totalFechas: fechas.length,
    estadisticasPorEquipo,
    encuentrosPorParEsperados: encuentrosEsperados,
    partidosLocalEsperados: localEsperado,
    partidosVisitanteEsperados: visitanteEsperado,
    excepciones: {
      encuentros: excEncuentros,
      localVisitante: excLocalVisitante,
      jornadasLibres: excJornadasLibres,
      jornadasInterzonales: excJornadasInterzonales
    }
  }
}

/**
 * Construye la lista de participantes para la llave de eliminación directa.
 * Los placeholders (LIBRE, INTERZONAL) nunca se enfrentan entre sí,
 * siempre quedan emparejados con un equipo real (bye).
 */
export function construirParticipantesEliminacion(
  equipos: {
    id: number
    nombre: string
    club: string
    torneo: string
    zona: string
  }[],
  fechasLibres: number,
  fechasInterzonales: number
): {
  id: number
  nombre: string
  club: string
  torneo: string
  zona: string
}[] {
  const mezclar = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5)

  const placeholderLibre = (i: number) => ({
    id: -1 - i,
    nombre: 'LIBRE',
    club: '',
    torneo: '',
    zona: ''
  })
  const placeholderInterzonal = (i: number) => ({
    id: -100 - i,
    nombre: 'INTERZONAL',
    club: '',
    torneo: '',
    zona: ''
  })

  const numPlaceholders = fechasLibres + fechasInterzonales
  const total = equipos.length + numPlaceholders
  const numPares = total / 2

  const equiposMezclados = mezclar([...equipos])
  const placeholders = mezclar([
    ...Array.from({ length: fechasLibres }, (_, i) => placeholderLibre(i)),
    ...Array.from({ length: fechasInterzonales }, (_, i) =>
      placeholderInterzonal(i)
    )
  ])

  const indicesPareConPlaceholder = mezclar(
    Array.from({ length: numPares }, (_, i) => i)
  ).slice(0, numPlaceholders)

  const paresConPlaceholder = new Set(indicesPareConPlaceholder)
  const resultado: typeof equipos = []
  let idxEquipo = 0
  let idxPlaceholder = 0

  for (let p = 0; p < numPares; p++) {
    if (paresConPlaceholder.has(p)) {
      resultado.push(equiposMezclados[idxEquipo++])
      resultado.push(placeholders[idxPlaceholder++])
    } else {
      resultado.push(equiposMezclados[idxEquipo++])
      resultado.push(equiposMezclados[idxEquipo++])
    }
  }

  return resultado
}

// ─── Movimiento de equipos ───────────────────────────────────────────────────

function inferirTipo(
  local: string,
  visitante: string
): 'regular' | 'libre' | 'interzonal' {
  if (local === 'LIBRE' || visitante === 'LIBRE') return 'libre'
  if (local === 'INTERZONAL' || visitante === 'INTERZONAL') return 'interzonal'
  return 'regular'
}

/**
 * Intercambia dos slots (local o visitante) entre fechas (pueden ser la misma o distintas).
 * Si los ids o las fechas no existen, retorna el array sin cambios.
 */
export function intercambiarEquiposEnFecha(
  fechas: FechaFixture[],
  origenNumeroFecha: number,
  origenId: string,
  origenPosicion: 'local' | 'visitante',
  destinoNumeroFecha: number,
  destinoId: string,
  destinoPosicion: 'local' | 'visitante'
): FechaFixture[] {
  if (
    origenNumeroFecha === destinoNumeroFecha &&
    origenId === destinoId &&
    origenPosicion === destinoPosicion
  )
    return fechas

  const fechaOrigen = fechas.find((d) => d.numeroFecha === origenNumeroFecha)
  const fechaDestino = fechas.find((d) => d.numeroFecha === destinoNumeroFecha)
  if (!fechaOrigen || !fechaDestino) return fechas

  const entradaOrigen = fechaOrigen.entradas.find((e) => e.id === origenId)
  const entradaDestino = fechaDestino.entradas.find((e) => e.id === destinoId)
  if (!entradaOrigen || !entradaDestino) return fechas

  const datosOrigen =
    origenPosicion === 'local'
      ? { nombre: entradaOrigen.local, id: entradaOrigen.idEquipoLocal }
      : { nombre: entradaOrigen.visitante, id: entradaOrigen.idEquipoVisitante }

  const datosDestino =
    destinoPosicion === 'local'
      ? { nombre: entradaDestino.local, id: entradaDestino.idEquipoLocal }
      : {
          nombre: entradaDestino.visitante,
          id: entradaDestino.idEquipoVisitante
        }

  const mismaFecha = origenNumeroFecha === destinoNumeroFecha

  return fechas.map((d) => {
    const esOrigen = d.numeroFecha === origenNumeroFecha
    const esDestino = d.numeroFecha === destinoNumeroFecha
    if (!esOrigen && !esDestino) return d

    return {
      ...d,
      entradas: d.entradas.map((e) => {
        // Mismo partido en la misma fecha: cada slot recibe los datos del otro
        if (mismaFecha && e.id === origenId && e.id === destinoId) {
          const resultado = { ...e }
          if (origenPosicion === 'local') {
            resultado.local = datosDestino.nombre
            resultado.idEquipoLocal = datosDestino.id
          } else {
            resultado.visitante = datosDestino.nombre
            resultado.idEquipoVisitante = datosDestino.id
          }
          if (destinoPosicion === 'local') {
            resultado.local = datosOrigen.nombre
            resultado.idEquipoLocal = datosOrigen.id
          } else {
            resultado.visitante = datosOrigen.nombre
            resultado.idEquipoVisitante = datosOrigen.id
          }
          resultado.tipo = inferirTipo(resultado.local, resultado.visitante)
          return resultado
        }
        if (esOrigen && e.id === origenId) {
          const newLocal =
            origenPosicion === 'local' ? datosDestino.nombre : e.local
          const newVisitante =
            origenPosicion === 'visitante' ? datosDestino.nombre : e.visitante
          return {
            ...e,
            tipo: inferirTipo(newLocal, newVisitante),
            local: newLocal,
            idEquipoLocal:
              origenPosicion === 'local' ? datosDestino.id : e.idEquipoLocal,
            visitante: newVisitante,
            idEquipoVisitante:
              origenPosicion === 'visitante'
                ? datosDestino.id
                : e.idEquipoVisitante
          }
        }
        if (esDestino && e.id === destinoId) {
          const newLocal =
            destinoPosicion === 'local' ? datosOrigen.nombre : e.local
          const newVisitante =
            destinoPosicion === 'visitante' ? datosOrigen.nombre : e.visitante
          return {
            ...e,
            tipo: inferirTipo(newLocal, newVisitante),
            local: newLocal,
            idEquipoLocal:
              destinoPosicion === 'local' ? datosOrigen.id : e.idEquipoLocal,
            visitante: newVisitante,
            idEquipoVisitante:
              destinoPosicion === 'visitante'
                ? datosOrigen.id
                : e.idEquipoVisitante
          }
        }
        return e
      })
    }
  })
}

/**
 * Intercambia dos participantes en la lista plana del bracket de eliminación.
 * Si los índices son iguales o inválidos, retorna el mismo array sin cambios.
 */
export function intercambiarParticipantesEnBracket(
  participantes: string[],
  indexA: number,
  indexB: number
): string[] {
  if (indexA === indexB) return participantes
  if (
    indexA < 0 ||
    indexB < 0 ||
    indexA >= participantes.length ||
    indexB >= participantes.length
  ) {
    return participantes
  }
  const resultado = [...participantes]
  resultado[indexA] = participantes[indexB]
  resultado[indexB] = participantes[indexA]
  return resultado
}

// ─── Implementación interna: método círculo ──────────────────────────────────

function metodoCirculo(
  participantes: Participante[],
  T: number
): FechaFixture[] {
  const fechas: FechaFixture[] = []
  const fijo = participantes[0]
  const rotantes = participantes.slice(1)

  for (let ronda = 0; ronda < T - 1; ronda++) {
    const entradasRegulares: EntradaFixture[] = []
    const entradasInterzonales: EntradaFixture[] = []
    const entradasLibres: EntradaFixture[] = []

    let matchIdx = 0

    const emparejamientos: [Participante, Participante, boolean][] = []
    emparejamientos.push([fijo, rotantes[T - 2], ronda % 2 === 0])

    for (let i = 0; i < (T - 2) / 2; i++) {
      emparejamientos.push([rotantes[i], rotantes[T - 3 - i], i % 2 === 0])
    }

    for (const [a, b, aEsLocal] of emparejamientos) {
      if (a.tipo !== 'equipo' && b.tipo !== 'equipo') continue

      const localP = aEsLocal ? a : b
      const visitanteP = aEsLocal ? b : a
      const entrada = construirEntrada(localP, visitanteP, ronda + 1, matchIdx)
      matchIdx++

      if (entrada.tipo === 'regular') entradasRegulares.push(entrada)
      else if (entrada.tipo === 'interzonal') entradasInterzonales.push(entrada)
      else entradasLibres.push(entrada)
    }

    fechas.push({
      numeroFecha: ronda + 1,
      entradas: [
        ...entradasRegulares,
        ...entradasInterzonales,
        ...entradasLibres
      ]
    })

    rotantes.unshift(rotantes.pop()!)
  }

  return fechas
}

function construirEntrada(
  localP: Participante,
  visitanteP: Participante,
  numFecha: number,
  matchIdx: number
): EntradaFixture {
  const id = `ida-f${numFecha}-p${matchIdx}`

  if (localP.tipo === 'libre' || visitanteP.tipo === 'libre') {
    const equipoReal = localP.tipo === 'equipo' ? localP : visitanteP
    return {
      id,
      tipo: 'libre',
      local: equipoReal.nombre,
      visitante: 'LIBRE',
      idEquipoLocal: equipoReal.idEquipo,
      idEquipoVisitante: null
    }
  }

  if (localP.tipo === 'interzonal' || visitanteP.tipo === 'interzonal') {
    return {
      id,
      tipo: 'interzonal',
      local: localP.tipo === 'equipo' ? localP.nombre : 'INTERZONAL',
      visitante:
        visitanteP.tipo === 'equipo' ? visitanteP.nombre : 'INTERZONAL',
      idEquipoLocal: localP.tipo === 'equipo' ? localP.idEquipo : null,
      idEquipoVisitante:
        visitanteP.tipo === 'equipo' ? visitanteP.idEquipo : null
    }
  }

  return {
    id,
    tipo: 'regular',
    local: localP.nombre,
    visitante: visitanteP.nombre,
    idEquipoLocal: localP.idEquipo,
    idEquipoVisitante: visitanteP.idEquipo
  }
}

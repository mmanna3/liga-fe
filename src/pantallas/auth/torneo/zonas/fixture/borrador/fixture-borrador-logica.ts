import type { EquipoDeLaZonaDTO } from '@/api/clients'
import { format, parse } from 'date-fns'
import { toDateOnly } from '@/logica-compartida/utils'
import type { ItemFixture } from '../tipos'

/**
 * Identificador estable del conjunto de equipos de la zona (ids ordenados).
 * Sirve para saber si el borrador en memoria sigue aplicando al mismo plantel.
 */
export function hashEquiposDeLaZona(equipos: EquipoDeLaZonaDTO[]): string {
  return [...equipos]
    .map((e) => e.id ?? '')
    .filter((id) => id !== '')
    .sort()
    .join('|')
}

export function ordenInicialListaFixture(
  equipos: EquipoDeLaZonaDTO[]
): ItemFixture[] {
  const sorted = [...equipos].sort((a, b) =>
    (a.nombre ?? '').localeCompare(b.nombre ?? '', 'es')
  )
  return sorted.map((equipo) => ({ type: 'equipo' as const, equipo }))
}

/**
 * Reaplica datos de equipo desde la API manteniendo orden y slots especiales.
 * Añade al final equipos nuevos que no estaban en la lista persistida.
 */
export function reconciliarListaOrdenConEquiposActuales(
  persistida: ItemFixture[],
  equiposActuales: EquipoDeLaZonaDTO[]
): ItemFixture[] {
  const mapa = new Map(equiposActuales.map((e) => [e.id ?? '', e] as const))
  const out: ItemFixture[] = []
  for (const item of persistida) {
    if (item.type === 'especial') {
      out.push(item)
      continue
    }
    const id = item.equipo.id ?? ''
    const fresh = mapa.get(id)
    if (fresh) out.push({ type: 'equipo', equipo: fresh })
  }
  const idsYa = new Set(
    out
      .filter(
        (i): i is Extract<ItemFixture, { type: 'equipo' }> =>
          i.type === 'equipo'
      )
      .map((i) => i.equipo.id ?? '')
  )
  for (const e of equiposActuales) {
    const id = e.id ?? ''
    if (id !== '' && !idsYa.has(id)) {
      out.push({ type: 'equipo', equipo: e })
      idsYa.add(id)
    }
  }
  return out
}

/** Actualiza referencias de equipo en una lista fijada usando la lista base actual. */
export function reconciliarListaFijadaConBase(
  listaFijada: ItemFixture[],
  listaBase: ItemFixture[]
): ItemFixture[] {
  const mapa = new Map(
    listaBase
      .filter(
        (i): i is Extract<ItemFixture, { type: 'equipo' }> =>
          i.type === 'equipo'
      )
      .map((i) => [i.equipo.id ?? '', i.equipo] as const)
  )
  return listaFijada.map((item) => {
    if (item.type !== 'equipo') return item
    const fresh = mapa.get(item.equipo.id ?? '')
    return fresh ? { type: 'equipo' as const, equipo: fresh } : item
  })
}

export function primeraFechaIsoDesdeDate(d: Date): string {
  return format(toDateOnly(d), 'yyyy-MM-dd')
}

export function dateDesdePrimeraFechaIso(iso: string): Date {
  return toDateOnly(parse(iso, 'yyyy-MM-dd', new Date()))
}

export function listaInicialDesdeBorradorOEquipos(params: {
  equipos: EquipoDeLaZonaDTO[]
  hashEquiposActual: string
  borrador: { hashEquipos: string; listaOrdenada: ItemFixture[] } | undefined
}): ItemFixture[] {
  const { equipos, hashEquiposActual, borrador } = params
  if (
    borrador?.hashEquipos === hashEquiposActual &&
    borrador.listaOrdenada.length > 0
  ) {
    return reconciliarListaOrdenConEquiposActuales(
      borrador.listaOrdenada,
      equipos
    )
  }
  return ordenInicialListaFixture(equipos)
}

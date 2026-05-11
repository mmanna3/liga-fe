import type { OpcionSelector } from '@/design-system/ykn-ui/selector-simple'

/** Coincide con el enum del backend */
export const CANCHA_SUPERFICIE_ID = {
  PastoNatural: 1,
  Sintetico: 2,
  Consultar: 3
} as const

export const OPCIONES_CANCHA_SUPERFICIE: OpcionSelector[] = [
  { id: '1', titulo: 'Pasto natural' },
  { id: '2', titulo: 'Sintético' },
  { id: '3', titulo: 'Consultar' }
]

/** Valor por defecto al crear un club (sin datos previos del servidor). */
export const CANCHA_SUPERFICIE_ID_POR_DEFECTO = CANCHA_SUPERFICIE_ID.Consultar

export function tituloCanchaSuperficiePorId(id: number | undefined): string {
  if (id === undefined) return '—'
  const idStr = String(id)
  return OPCIONES_CANCHA_SUPERFICIE.find((o) => o.id === idStr)?.titulo ?? '—'
}

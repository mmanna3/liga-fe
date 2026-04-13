import type { OpcionSelector } from '@/design-system/ykn-ui/selector-simple'

/** Coincide con el enum del backend */
export const CANCHA_TIPO_ID = {
  Cubierta: 1,
  Descubierta: 2,
  Semidescubierta: 3,
  Consultar: 4
} as const

export const OPCIONES_CANCHA_TIPO: OpcionSelector[] = [
  { id: '1', titulo: 'Cubierta' },
  { id: '2', titulo: 'Descubierta' },
  { id: '3', titulo: 'Semidescubierta' },
  { id: '4', titulo: 'Consultar' }
]

/** Valor por defecto al crear un club (sin datos previos del servidor). */
export const CANCHA_TIPO_ID_POR_DEFECTO = CANCHA_TIPO_ID.Descubierta

export function tituloCanchaTipoPorId(id: number | undefined): string {
  const idStr = String(id ?? CANCHA_TIPO_ID_POR_DEFECTO)
  return OPCIONES_CANCHA_TIPO.find((o) => o.id === idStr)?.titulo ?? '—'
}

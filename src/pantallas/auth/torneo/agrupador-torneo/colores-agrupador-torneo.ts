/**
 * Valores alineados con ColorEnum del backend (la API devuelve estas cadenas tal cual).
 */
export const COLORES_AGRUPADOR_TORNEO = [
  'Negro',
  'Azul',
  'Rojo',
  'Verde'
  // 'Amarillo',
  // 'Naranja',
  // 'Violeta'
] as const

export type ColorAgrupadorTorneo = (typeof COLORES_AGRUPADOR_TORNEO)[number]

const lista = COLORES_AGRUPADOR_TORNEO as readonly string[]

/** Normaliza el valor devuelto por la API al catálogo conocido. */
export function colorAgrupadorValidoODefecto(
  color: string | undefined
): ColorAgrupadorTorneo {
  const c = color?.trim()
  return c && lista.includes(c)
    ? (c as ColorAgrupadorTorneo)
    : COLORES_AGRUPADOR_TORNEO[0]
}

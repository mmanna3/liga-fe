import type {
  EntradaDeZona,
  ValidacionEmparejamientoInterzonal,
  ValidacionZona
} from './fixture-tipos'

// ─── Validación ──────────────────────────────────────────────────────────────

/** Devuelve true si n es potencia de 2 (2, 4, 8, 16, ...) */
export function esPotenciaDe2(n: number): boolean {
  return n >= 2 && (n & (n - 1)) === 0
}

/** Devuelve true si N + fechasLibres + fechasInterzonales es par */
export function esConfiguracionValida(
  cantidadEquipos: number,
  fechasLibres: number,
  fechasInterzonales: number
): boolean {
  const T = cantidadEquipos + fechasLibres + fechasInterzonales
  return T >= 2 && T % 2 === 0
}

/**
 * Devuelve true si N + fechasLibres + fechasInterzonales es potencia de 2.
 * La llave de eliminación directa requiere 2, 4, 8, 16, ... participantes.
 */
export function esValidoParaEliminacion(
  cantidadEquipos: number,
  fechasLibres: number,
  fechasInterzonales: number
): boolean {
  const T = cantidadEquipos + fechasLibres + fechasInterzonales
  return esPotenciaDe2(T)
}

/** Valida cada zona individualmente (fechasLibres y fechasInterzonales por zona) */
export function validarZonas(
  zonas: EntradaDeZona[],
  modo: 'todos-contra-todos' | 'eliminacion' = 'todos-contra-todos'
): ValidacionZona[] {
  return zonas.map((zona) => {
    const T = zona.equipos.length + zona.fechasLibres + zona.fechasInterzonales
    const esValida =
      modo === 'eliminacion' ? esPotenciaDe2(T) : T >= 2 && T % 2 === 0
    return {
      idZona: zona.id,
      nombreZona: zona.nombre,
      cantidadEquipos: zona.equipos.length,
      totalParticipantes: T,
      esValida
    }
  })
}

/**
 * Valida que el emparejamiento interzonal sea globalmente posible.
 *
 * Condiciones necesarias y suficientes:
 *   1. El total de slots interzonales (equipos × fechasInterzonales sumado de
 *      todas las zonas) debe ser par — cada partido consume 2 slots.
 *   2. Ninguna zona puede tener más slots que la suma del resto — de lo
 *      contrario, esa zona no tendría suficientes rivales de otras zonas.
 *
 * Slots de una zona = equipos.length × fechasInterzonales
 */
export function validarEmparejamientoInterzonal(
  zonas: EntradaDeZona[]
): ValidacionEmparejamientoInterzonal {
  if (zonas.length <= 1) return { esValido: true, mensaje: '' }

  const slots = zonas.map((z) => z.equipos.length * z.fechasInterzonales)
  const total = slots.reduce((a, b) => a + b, 0)

  if (total === 0) return { esValido: true, mensaje: '' }

  if (total % 2 !== 0) {
    return {
      esValido: false,
      mensaje: `El total de slots interzonales (${total}) debe ser par para poder emparejar todos los partidos.`
    }
  }

  const maxIdx = slots.indexOf(Math.max(...slots))
  const maxSlots = slots[maxIdx]
  const resto = total - maxSlots

  if (maxSlots > resto) {
    return {
      esValido: false,
      mensaje: `${zonas[maxIdx].nombre} tiene ${maxSlots} slots interzonales pero solo hay ${resto} disponibles en las demás zonas. Reducí sus fechas interzonales o aumentá las del resto.`
    }
  }

  return { esValido: true, mensaje: '' }
}

// ─── Cálculo de fechas ───────────────────────────────────────────────────────

/** Cantidad total de jornadas para una zona */
export function calcularTotalFechas(
  cantidadEquipos: number,
  fechasLibres: number,
  fechasInterzonales: number,
  vueltas: 'ida' | 'ida-y-vuelta'
): number {
  const T = cantidadEquipos + fechasLibres + fechasInterzonales
  if (T < 2) return 0
  const fechasIda = T - 1
  return vueltas === 'ida-y-vuelta' ? fechasIda * 2 : fechasIda
}

/** Cantidad de jornadas con zonas: cada zona tiene su propio cálculo. Retorna el máximo. */
export function calcularTotalFechasPorZonas(
  zonas: EntradaDeZona[],
  vueltas: 'ida' | 'ida-y-vuelta'
): number {
  if (zonas.length === 0) return 0
  return Math.max(
    ...zonas.map((z) =>
      calcularTotalFechas(
        z.equipos.length,
        z.fechasLibres,
        z.fechasInterzonales,
        vueltas
      )
    )
  )
}

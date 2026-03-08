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
 * Valida que el emparejamiento interzonal sea posible.
 * Para que cada equipo tenga rival en cada fecha, TODAS las zonas deben tener
 * la misma cantidad de fechasInterzonales (o todas 0).
 */
export function validarEmparejamientoInterzonal(
  zonas: EntradaDeZona[]
): ValidacionEmparejamientoInterzonal {
  if (zonas.length <= 1) return { esValido: true, mensaje: '' }

  const valores = zonas.map((z) => z.fechasInterzonales)
  const conInterzonal = valores.filter((v) => v > 0)

  if (conInterzonal.length === 0) return { esValido: true, mensaje: '' }

  const primero = conInterzonal[0]
  const todosIguales = conInterzonal.every((v) => v === primero)

  if (!todosIguales) {
    const porZona = zonas
      .filter((z) => z.fechasInterzonales > 0)
      .map((z) => `${z.nombre}: ${z.fechasInterzonales}`)
      .join(', ')
    return {
      esValido: false,
      mensaje: `Todas las zonas deben tener la misma cantidad de fechas interzonales por equipo para que cada equipo tenga rival en cada fecha. Actual: ${porZona}`
    }
  }

  const zonasConCero = zonas.filter((z) => z.fechasInterzonales === 0)
  if (zonasConCero.length > 0) {
    return {
      esValido: false,
      mensaje: `Las zonas ${zonasConCero.map((z) => z.nombre).join(', ')} tienen 0 interzonal mientras otras tienen ${primero}. Todas deben ser iguales.`
    }
  }

  if (zonas.length >= 3 && primero % 2 !== 0) {
    return {
      esValido: false,
      mensaje: `Con 3 o más zonas, la cantidad interzonal debe ser par para que cada equipo tenga rival en cada fecha (actual: ${primero}).`
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

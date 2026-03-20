import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normaliza un Date a "solo día" (mediodía UTC) para evitar desfasajes por zona
 * horaria al serializar (ej. 19/3 23:00 GMT-3 → 20/3 en UTC si se usa ISO).
 * También corrige fechas que vienen del backend (ISO "YYYY-MM-DD" → UTC midnight),
 * que en zonas negativas se mostrarían como el día anterior.
 */
export function toDateOnly(date: Date): Date {
  const isUtcMidnight =
    date.getUTCHours() === 0 &&
    date.getUTCMinutes() === 0 &&
    date.getUTCSeconds() === 0 &&
    date.getUTCMilliseconds() === 0

  if (isUtcMidnight) {
    return new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        12,
        0,
        0,
        0
      )
    )
  }
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0)
  )
}

// Moverlo a estado-jugador
export enum EstadoJugador {
  FichajePendienteDeAprobacion = 1,
  FichajeRechazado = 2,
  Activo = 3,
  Suspendido = 4,
  Inhabilitado = 5,
  AprobadoPendienteDePago = 6
}

export enum EstadoDelegado {
  PendienteDeAprobacion = 1,
  Rechazado = 2,
  Activo = 3
}

export const estadoBadgeClassDelegado: Record<number, string> = {
  1: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  2: 'bg-red-100 text-red-800 hover:bg-red-100',
  3: 'bg-green-100 text-green-800 hover:bg-green-100'
}

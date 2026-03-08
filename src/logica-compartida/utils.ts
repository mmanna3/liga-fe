import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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

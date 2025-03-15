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

import { api } from '@/api/api'
import {
  ActivarJugadorDTO,
  EquipoDelJugadorDTO,
  InhabilitarJugadorDTO,
  PagarFichajeJugadorDTO,
  SuspenderJugadorDTO
} from '@/api/clients'
import { EstadoJugador } from './utils'

export type JugadorParaCambioDeEstadoDTO =
  | PagarFichajeJugadorDTO
  | SuspenderJugadorDTO
  | InhabilitarJugadorDTO
  | ActivarJugadorDTO

export type AccionTipo = (
  jugador: JugadorParaCambioDeEstadoDTO
) => Promise<number>

const suspender = {
  label: 'Suspender',
  action: (j: SuspenderJugadorDTO) => api.suspenderJugador(j),
  mensajeExito: 'El jugador fue suspendido.'
}
const inhabilitar = {
  label: 'Inhabilitar',
  action: (j: InhabilitarJugadorDTO) => api.inhabilitarJugador(j),
  mensajeExito: 'El jugador fue inhabilitado.'
}
const activar = {
  label: 'Activar',
  action: (j: ActivarJugadorDTO) => api.activarJugador(j),
  mensajeExito: 'El jugador se marcó como "activo".'
}
const pagarFichaje = {
  label: 'Pagar fichaje',
  action: (j: PagarFichajeJugadorDTO) => api.pagarFichajeDelJugador(j),
  mensajeExito: 'El jugador se marcó como "activo".'
}

export const estadoTransiciones: Record<
  number,
  {
    label: string
    action: AccionTipo
    mensajeExito: string
  }[]
> = {
  [EstadoJugador.AprobadoPendienteDePago]: [pagarFichaje],
  [EstadoJugador.Activo]: [suspender, inhabilitar],
  [EstadoJugador.Suspendido]: [activar, inhabilitar],
  [EstadoJugador.Inhabilitado]: [activar, suspender]
}

export const obtenerNombreEstado = (
  valor: number
): EstadoJugador | undefined => {
  return Object.values(EstadoJugador).includes(valor)
    ? (valor as EstadoJugador)
    : undefined
}

export const obtenerEstado = (
  equipos: EquipoDelJugadorDTO[],
  jugadorEquipoId: number
): EstadoJugador | null => {
  let equipo
  if (equipos) {
    equipo = equipos.find((equipo) => equipo.id === jugadorEquipoId)
    if (equipo) {
      const estado = obtenerNombreEstado(equipo.estado!)
      return estado || null
    }
  }

  return null
}

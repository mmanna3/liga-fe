import type {
  ArbitroElegibleAsignacionDTO,
  JornadaAsignacionDTO
} from '@/api/clients'
import { useMemo } from 'react'
import AutocompleteArbitro, {
  construirOpcionesArbitro
} from './autocomplete-arbitro'
import {
  type AdvertenciaArbitro,
  formatearEtiquetaFechaAsignacion,
  mismaFechaCalendario
} from './utilidades-asignacion'

interface SelectorArbitroJornadaProps {
  titulo: string
  jornada: JornadaAsignacionDTO
  arbitrosElegibles: ArbitroElegibleAsignacionDTO[]
  valor: string
  otroSlotArbitroId: string
  deshabilitado?: boolean
  mostrarConflictos?: boolean
  accionDerecha?: React.ReactNode
  alCambiar: (arbitroId: string) => void
}

const MENSAJE_EQUIPO_PROHIBIDO = 'Este equipo está prohibido para este árbitro'

function obtenerConflictoFecha(
  arbitro: ArbitroElegibleAsignacionDTO,
  jornada: JornadaAsignacionDTO
): AdvertenciaArbitro | null {
  const asignaciones = arbitro.jornadasAsignadasEnProximasFechas ?? []
  const conflicto = asignaciones.find(
    (j) =>
      j.jornadaId !== jornada.id &&
      j.dia &&
      mismaFechaCalendario(new Date(j.dia), jornada.dia)
  )
  if (!conflicto) return null
  return {
    tipo: 'conflicto_fecha',
    titulo: 'Ya tiene jornada ese día',
    detalle: `${conflicto.torneoNombre} · ${conflicto.local} vs ${conflicto.visitante}`
  }
}

function obtenerProhibicionEquipo(
  arbitro: ArbitroElegibleAsignacionDTO,
  jornada: JornadaAsignacionDTO
): AdvertenciaArbitro | null {
  const ids = arbitro.equiposProhibidosIds ?? []
  const local = jornada.localEquipoId
  const visitante = jornada.visitanteEquipoId
  if (
    (local != null && ids.includes(local)) ||
    (visitante != null && ids.includes(visitante))
  ) {
    return {
      tipo: 'equipo_prohibido',
      titulo: MENSAJE_EQUIPO_PROHIBIDO
    }
  }
  return null
}

function obtenerAdvertenciasDirigioReciente(
  arbitro: ArbitroElegibleAsignacionDTO,
  jornada: JornadaAsignacionDTO
): AdvertenciaArbitro[] {
  const recientes =
    arbitro.jornadasEnUltimasFechas?.filter(
      (j) => j.zonaId === jornada.zonaId
    ) ?? []

  const equiposJornada = [
    { id: jornada.localEquipoId, nombre: jornada.local ?? '' },
    { id: jornada.visitanteEquipoId, nombre: jornada.visitante ?? '' }
  ]

  const advertencias: AdvertenciaArbitro[] = []

  for (const equipo of equiposJornada) {
    for (const pasada of recientes) {
      const participo =
        pasada.localEquipoId === equipo.id ||
        pasada.visitanteEquipoId === equipo.id
      if (!participo) continue

      const numeroFecha = formatearEtiquetaFechaAsignacion(
        pasada.fechaNumero,
        pasada.instanciaNombre
      )
      advertencias.push({
        tipo: 'dirigio_reciente',
        titulo: `Este árbitro ya dirigió a ${equipo.nombre} en la fecha ${numeroFecha}`
      })
    }
  }

  return advertencias
}

function obtenerAdvertencias(
  arbitro: ArbitroElegibleAsignacionDTO,
  jornada: JornadaAsignacionDTO
): AdvertenciaArbitro[] {
  const advertencias: AdvertenciaArbitro[] = []
  const conflictoFecha = obtenerConflictoFecha(arbitro, jornada)
  if (conflictoFecha) advertencias.push(conflictoFecha)
  const prohibicion = obtenerProhibicionEquipo(arbitro, jornada)
  if (prohibicion) advertencias.push(prohibicion)
  advertencias.push(...obtenerAdvertenciasDirigioReciente(arbitro, jornada))
  return advertencias
}

export default function SelectorArbitroJornada({
  titulo,
  jornada,
  arbitrosElegibles,
  valor,
  otroSlotArbitroId,
  deshabilitado,
  mostrarConflictos = true,
  accionDerecha,
  alCambiar
}: SelectorArbitroJornadaProps) {
  const opciones = useMemo(
    () =>
      construirOpcionesArbitro(
        arbitrosElegibles,
        otroSlotArbitroId,
        mostrarConflictos ? (a) => obtenerAdvertencias(a, jornada) : () => []
      ),
    [arbitrosElegibles, otroSlotArbitroId, jornada, mostrarConflictos]
  )

  const arbitroSeleccionado = arbitrosElegibles.find(
    (a) => String(a.id) === valor
  )
  const advertenciasSeleccionadas =
    mostrarConflictos && arbitroSeleccionado && valor !== 'sin-arbitro'
      ? obtenerAdvertencias(arbitroSeleccionado, jornada)
      : []

  return (
    <AutocompleteArbitro
      titulo={titulo}
      valor={valor}
      opciones={opciones}
      deshabilitado={deshabilitado}
      advertenciasSeleccionadas={advertenciasSeleccionadas}
      accionDerecha={accionDerecha}
      alCambiar={alCambiar}
    />
  )
}

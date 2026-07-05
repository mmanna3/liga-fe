import type {
  ArbitroElegibleAsignacionDTO,
  JornadaAsignacionDTO
} from '@/api/clients'
import { useMemo } from 'react'
import AutocompleteArbitro, {
  construirOpcionesArbitro
} from './autocomplete-arbitro'
import { mismaFechaCalendario } from './utilidades-asignacion'

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
): string | null {
  const asignaciones = arbitro.jornadasAsignadasEnProximasFechas ?? []
  const conflicto = asignaciones.find(
    (j) =>
      j.jornadaId !== jornada.id &&
      j.dia &&
      mismaFechaCalendario(new Date(j.dia), jornada.dia)
  )
  if (!conflicto) return null
  return `Ya tiene jornada ese día: ${conflicto.torneoNombre} · ${conflicto.local} vs ${conflicto.visitante}`
}

function obtenerProhibicionEquipo(
  arbitro: ArbitroElegibleAsignacionDTO,
  jornada: JornadaAsignacionDTO
): string | null {
  const ids = arbitro.equiposProhibidosIds ?? []
  const local = jornada.localEquipoId
  const visitante = jornada.visitanteEquipoId
  if (
    (local != null && ids.includes(local)) ||
    (visitante != null && ids.includes(visitante))
  ) {
    return MENSAJE_EQUIPO_PROHIBIDO
  }
  return null
}

function obtenerAdvertencias(
  arbitro: ArbitroElegibleAsignacionDTO,
  jornada: JornadaAsignacionDTO
): string[] {
  const advertencias: string[] = []
  const conflictoFecha = obtenerConflictoFecha(arbitro, jornada)
  if (conflictoFecha) advertencias.push(conflictoFecha)
  const prohibicion = obtenerProhibicionEquipo(arbitro, jornada)
  if (prohibicion) advertencias.push(prohibicion)
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

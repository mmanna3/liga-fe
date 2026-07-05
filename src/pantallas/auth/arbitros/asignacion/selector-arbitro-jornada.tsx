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

function obtenerConflicto(
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
  return `${conflicto.torneoNombre} · ${conflicto.local} vs ${conflicto.visitante}`
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
        mostrarConflictos ? (a) => obtenerConflicto(a, jornada) : () => null
      ),
    [arbitrosElegibles, otroSlotArbitroId, jornada, mostrarConflictos]
  )

  const arbitroSeleccionado = arbitrosElegibles.find(
    (a) => String(a.id) === valor
  )
  const textoConflicto =
    mostrarConflictos && arbitroSeleccionado && valor !== 'sin-arbitro'
      ? obtenerConflicto(arbitroSeleccionado, jornada)
      : null

  return (
    <AutocompleteArbitro
      titulo={titulo}
      valor={valor}
      opciones={opciones}
      deshabilitado={deshabilitado}
      textoConflictoSeleccionado={textoConflicto}
      accionDerecha={accionDerecha}
      alCambiar={alCambiar}
    />
  )
}

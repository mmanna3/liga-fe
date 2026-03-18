import type { EquipoDeLaZonaDTO } from '@/api/clients'
import { LocalVisitanteEnum } from '@/api/clients'
import { Button } from '@/design-system/base-ui/button'
import Icono from '@/design-system/ykn-ui/icono'

// ---------------------------------------------------------------------------
// Tipos del borrador
// ---------------------------------------------------------------------------

export type JornadaBorrador = {
  tipo: string
  resultadosVerificados: boolean
  localId?: number
  visitanteId?: number
  equipoId?: number
  localOVisitante?: LocalVisitanteEnum
}

export type CampoReemplazo = 'localId' | 'visitanteId' | 'equipoId'

export type PendienteReemplazo = {
  jornadaIdx: number
  campo: CampoReemplazo
  nombreActual: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function claseEspecial(label: string) {
  if (label === 'Interzonal') return 'text-blue-700 bg-blue-100 px-1 rounded'
  if (label === 'Libre') return 'text-yellow-700 bg-yellow-100 px-1 rounded'
  return ''
}

// ---------------------------------------------------------------------------
// Fila de jornada en modo edición
// ---------------------------------------------------------------------------

export function JornadaFilaEdicion({
  j,
  equipoMap,
  onClickEquipo,
  onEliminar
}: {
  j: JornadaBorrador
  equipoMap: Map<number, EquipoDeLaZonaDTO>
  onClickEquipo: (campo: CampoReemplazo, nombreActual: string) => void
  onEliminar: () => void
}) {
  const nombreEquipo = (id: number | undefined) =>
    id != null ? (equipoMap.get(id)?.nombre ?? '—') : '—'

  let localLabel: string
  let visitanteLabel: string
  let localCampo: CampoReemplazo | null = null
  let visitanteCampo: CampoReemplazo | null = null

  if (j.tipo === 'Normal') {
    localLabel = nombreEquipo(j.localId)
    visitanteLabel = nombreEquipo(j.visitanteId)
    localCampo = 'localId'
    visitanteCampo = 'visitanteId'
  } else if (j.tipo === 'Libre') {
    localLabel = nombreEquipo(j.equipoId)
    visitanteLabel = 'Libre'
    localCampo = 'equipoId'
  } else {
    // Interzonal
    const esLocal = j.localOVisitante !== LocalVisitanteEnum._2
    if (esLocal) {
      localLabel = nombreEquipo(j.equipoId)
      visitanteLabel = 'Interzonal'
      localCampo = 'equipoId'
    } else {
      localLabel = 'Interzonal'
      visitanteLabel = nombreEquipo(j.equipoId)
      visitanteCampo = 'equipoId'
    }
  }

  return (
    <div className='grid grid-cols-[1fr_1fr_auto] gap-2 text-sm py-1 items-center'>
      {localCampo ? (
        <button
          className='text-right underline decoration-dotted underline-offset-2 hover:text-primary transition-colors'
          onClick={() => onClickEquipo(localCampo!, localLabel)}
        >
          {localLabel}
        </button>
      ) : (
        <span className={`text-right ${claseEspecial(localLabel)}`}>
          {localLabel}
        </span>
      )}

      {visitanteCampo ? (
        <button
          className='text-left underline decoration-dotted underline-offset-2 hover:text-primary transition-colors'
          onClick={() => onClickEquipo(visitanteCampo!, visitanteLabel)}
        >
          {visitanteLabel}
        </button>
      ) : (
        <span className={`text-left ${claseEspecial(visitanteLabel)}`}>
          {visitanteLabel}
        </span>
      )}

      <Button
        variant='ghost'
        size='icon'
        className='h-6 w-6 text-muted-foreground hover:text-destructive'
        onClick={onEliminar}
      >
        <Icono nombre='Eliminar' className='size-3.5' />
      </Button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Construcción de JornadaBorrador desde ItemFixture
// ---------------------------------------------------------------------------

import type { ItemFixture } from './types'

export function buildJornadaBorrador(
  local: ItemFixture,
  visitante: ItemFixture
): JornadaBorrador {
  if (local.type === 'equipo' && visitante.type === 'equipo') {
    return {
      tipo: 'Normal',
      resultadosVerificados: false,
      localId: Number(local.equipo.id!),
      visitanteId: Number(visitante.equipo.id!)
    }
  }
  if (local.type === 'equipo' && visitante.type === 'especial') {
    return visitante.valor === 'LIBRE'
      ? {
          tipo: 'Libre',
          resultadosVerificados: false,
          equipoId: Number(local.equipo.id!)
        }
      : {
          tipo: 'Interzonal',
          resultadosVerificados: false,
          equipoId: Number(local.equipo.id!),
          localOVisitante: LocalVisitanteEnum._1
        }
  }
  if (local.type === 'especial' && visitante.type === 'equipo') {
    return local.valor === 'LIBRE'
      ? {
          tipo: 'Libre',
          resultadosVerificados: false,
          equipoId: Number(visitante.equipo.id!)
        }
      : {
          tipo: 'Interzonal',
          resultadosVerificados: false,
          equipoId: Number(visitante.equipo.id!),
          localOVisitante: LocalVisitanteEnum._2
        }
  }
  return { tipo: 'Normal', resultadosVerificados: false }
}

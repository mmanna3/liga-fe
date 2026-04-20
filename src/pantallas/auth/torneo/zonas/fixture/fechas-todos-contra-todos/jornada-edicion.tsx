import type { EquipoDeLaZonaDTO } from '@/api/clients'
import { LocalVisitanteEnum } from '@/api/clients'
import { Button } from '@/design-system/base-ui/button'
import Icono from '@/design-system/ykn-ui/icono'
import {
  claseVistaPreviaEspecial,
  etiquetaInterzonal,
  type ItemFixture
} from '../tipos'

// ---------------------------------------------------------------------------
// Tipos del borrador
// ---------------------------------------------------------------------------

export type JornadaBorrador = {
  tipo: string
  resultadosVerificados: boolean
  localId?: number
  visitanteId?: number
  /** Jornada tipo Libre e Interzonal: equipo de la zona */
  equipoId?: number
  localOVisitante?: LocalVisitanteEnum
  /** Variante Interzonal (1–4), alineado con el backend */
  numero?: number
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
  return claseVistaPreviaEspecial(label)
}

// ---------------------------------------------------------------------------
// Fila de jornada en modo edición
// ---------------------------------------------------------------------------

export function JornadaFilaEdicion({
  j,
  jornadaIdx,
  equipoMap,
  onClickEquipo,
  onEliminar
}: {
  j: JornadaBorrador
  jornadaIdx: number
  equipoMap: Map<number, EquipoDeLaZonaDTO>
  onClickEquipo: (
    jornadaIdx: number,
    campo: CampoReemplazo,
    nombreActual: string
  ) => void
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
    const esLocal = j.localOVisitante !== LocalVisitanteEnum._2
    if (esLocal) {
      localLabel = nombreEquipo(j.equipoId)
      visitanteLabel = 'Libre'
      localCampo = 'equipoId'
    } else {
      localLabel = 'Libre'
      visitanteLabel = nombreEquipo(j.equipoId)
      visitanteCampo = 'equipoId'
    }
  } else {
    // Interzonal
    const esLocal = j.localOVisitante !== LocalVisitanteEnum._2
    const inter = etiquetaInterzonal(j.numero)
    if (esLocal) {
      localLabel = nombreEquipo(j.equipoId)
      visitanteLabel = inter
      localCampo = 'equipoId'
    } else {
      localLabel = inter
      visitanteLabel = nombreEquipo(j.equipoId)
      visitanteCampo = 'equipoId'
    }
  }

  return (
    <div className='grid grid-cols-[1fr_1fr_auto] gap-2 text-sm py-1 items-center'>
      {localCampo ? (
        <button
          className='text-right underline decoration-dotted underline-offset-2 hover:text-primary transition-colors'
          onClick={() => onClickEquipo(jornadaIdx, localCampo!, localLabel)}
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
          onClick={() =>
            onClickEquipo(jornadaIdx, visitanteCampo!, visitanteLabel)
          }
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
          equipoId: Number(local.equipo.id!),
          localOVisitante: LocalVisitanteEnum._1
        }
      : {
          tipo: 'Interzonal',
          resultadosVerificados: false,
          equipoId: Number(local.equipo.id!),
          localOVisitante: LocalVisitanteEnum._1,
          numero: visitante.numero
        }
  }
  if (local.type === 'especial' && visitante.type === 'equipo') {
    return local.valor === 'LIBRE'
      ? {
          tipo: 'Libre',
          resultadosVerificados: false,
          equipoId: Number(visitante.equipo.id!),
          localOVisitante: LocalVisitanteEnum._2
        }
      : {
          tipo: 'Interzonal',
          resultadosVerificados: false,
          equipoId: Number(visitante.equipo.id!),
          localOVisitante: LocalVisitanteEnum._2,
          numero: local.numero
        }
  }
  return { tipo: 'Normal', resultadosVerificados: false }
}

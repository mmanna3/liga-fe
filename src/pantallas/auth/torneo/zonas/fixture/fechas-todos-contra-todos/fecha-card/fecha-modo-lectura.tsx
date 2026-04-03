import type { FechaTodosContraTodosDTO, JornadaDTO } from '@/api/clients'
import { LocalVisitanteEnum } from '@/api/clients'
import { Button } from '@/design-system/base-ui/button'
import ModalEliminacion from '@/design-system/modal-eliminacion'
import Icono from '@/design-system/ykn-ui/icono'
import { useState } from 'react'
import {
  BotonCargarResultados,
  ESTADO_BOTON_CARGAR_RESULTADOS,
  jornadaTieneResultadosCargados
} from '../../components/boton-cargar-resultados'
import { claseEspecial } from '../jornada-edicion'
import { ModalCargaResultados } from './modal-carga-resultados'

function formatDia(dia: Date | undefined): string {
  if (!dia) return ''
  return `${dia.getUTCDate()}/${dia.getUTCMonth() + 1}`
}

export function etiquetaFecha(fecha: FechaTodosContraTodosDTO): string {
  return `Fecha ${fecha.numero}`
}

export { jornadaTieneResultadosCargados }
export type { EstadoBotonCargarResultados } from '../../components/boton-cargar-resultados'

function JornadaFilaVista({
  j,
  onCargarResultadosClick
}: {
  j: JornadaDTO
  onCargarResultadosClick: (jornada: JornadaDTO) => void
}) {
  let localLabel: string
  let visitanteLabel: string

  if (j.tipo === 'Normal') {
    localLabel = j.local ?? '—'
    visitanteLabel = j.visitante ?? '—'
  } else if (j.tipo === 'Libre') {
    localLabel = j.equipoLocal ?? '—'
    visitanteLabel = 'Libre'
  } else {
    const esLocal = j.localOVisitante !== LocalVisitanteEnum._2
    localLabel = esLocal ? (j.equipo ?? '—') : 'Interzonal'
    visitanteLabel = esLocal ? 'Interzonal' : (j.equipo ?? '—')
  }

  const estadoBoton = !jornadaTieneResultadosCargados(j)
    ? ESTADO_BOTON_CARGAR_RESULTADOS[0]
    : !j.resultadosVerificados
      ? ESTADO_BOTON_CARGAR_RESULTADOS[1]
      : ESTADO_BOTON_CARGAR_RESULTADOS[2]

  return (
    <div className='grid grid-cols-[1fr_1fr_auto] gap-4 text-sm py-1 items-center'>
      <span className={`text-right min-w-0 ${claseEspecial(localLabel)}`}>
        {localLabel}
      </span>
      <span className={`text-left min-w-0 ${claseEspecial(visitanteLabel)}`}>
        {visitanteLabel}
      </span>
      <BotonCargarResultados
        estado={estadoBoton}
        onClick={() => onCargarResultadosClick(j)}
      />
    </div>
  )
}

export interface FechaModoLecturaProps {
  fecha: FechaTodosContraTodosDTO
  zonaId: number
  onEditar: () => void
  onEliminar: () => void
  estaCargandoEliminar: boolean
  mostrarBotonEliminar: boolean
}

export function FechaModoLectura({
  fecha,
  zonaId,
  onEditar,
  onEliminar,
  estaCargandoEliminar,
  mostrarBotonEliminar
}: FechaModoLecturaProps) {
  const diaDisplay = formatDia(fecha.dia)
  const [modalCargarResultadosAbierto, setModalCargarResultadosAbierto] =
    useState(false)
  const [jornadaParaResultados, setJornadaParaResultados] =
    useState<JornadaDTO | null>(null)

  return (
    <>
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center gap-2'>
          <h3 className='font-semibold'>{etiquetaFecha(fecha)}</h3>
          {diaDisplay && (
            <span className='text-sm text-muted-foreground'>
              — {diaDisplay}
            </span>
          )}
        </div>
        <div className='flex items-center gap-1'>
          <Button
            variant='ghost'
            size='icon'
            className='h-7 w-7'
            onClick={onEditar}
          >
            <Icono
              nombre='Editar'
              className='size-3.5 text-muted-foreground '
            />
          </Button>
          {mostrarBotonEliminar && (
            <ModalEliminacion
              titulo='Eliminar fecha'
              subtitulo={`¿Confirmás que querés eliminar la ${etiquetaFecha(fecha)}? Se eliminarán también todas sus jornadas.`}
              eliminarTexto='Eliminar fecha'
              estaCargando={estaCargandoEliminar}
              eliminarOnClick={onEliminar}
              trigger={
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-7 w-7 text-muted-foreground hover:text-destructive'
                >
                  <Icono nombre='Eliminar' className='size-3.5' />
                </Button>
              }
            />
          )}
        </div>
      </div>

      <div className='grid grid-cols-[1fr_1fr_auto] gap-4 text-xs font-medium text-muted-foreground mb-1 items-center'>
        <span className='text-right'>LOCAL</span>
        <span className='text-left'>VISITANTE</span>
        <span className='w-7 shrink-0' aria-hidden />
      </div>
      <div className='space-y-1 [&>div:not(:last-child)]:border-b [&>div:not(:last-child)]:border-muted-foreground/10'>
        {(fecha.jornadas ?? []).map((j, i) => (
          <JornadaFilaVista
            key={i}
            j={j}
            onCargarResultadosClick={(jornada) => {
              setJornadaParaResultados(jornada)
              setModalCargarResultadosAbierto(true)
            }}
          />
        ))}
      </div>

      <ModalCargaResultados
        open={modalCargarResultadosAbierto}
        onOpenChange={(abierto) => {
          setModalCargarResultadosAbierto(abierto)
          if (!abierto) setJornadaParaResultados(null)
        }}
        jornada={jornadaParaResultados}
        zonaId={zonaId}
        numeroFecha={fecha.numero}
        jornadasDeLaFecha={fecha.jornadas ?? []}
      />
    </>
  )
}

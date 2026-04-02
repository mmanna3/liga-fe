import type { FechaDTO, JornadaDTO } from '@/api/clients'
import { LocalVisitanteEnum } from '@/api/clients'
import { Button } from '@/design-system/base-ui/button'
import ModalEliminacion from '@/design-system/modal-eliminacion'
import Icono from '@/design-system/ykn-ui/icono'
import { useState } from 'react'
import { claseEspecial } from '../jornada-edicion'
import { ModalCargaResultados } from './modal-carga-resultados'

function formatDia(dia: Date | undefined): string {
  if (!dia) return ''
  return `${dia.getUTCDate()}/${dia.getUTCMonth() + 1}`
}

/** Título visible: instancia (eliminación directa) o número de fecha (todos contra todos). */
export function etiquetaFecha(fecha: FechaDTO): string {
  const nombre = fecha.instanciaNombre?.trim()
  if (nombre) return nombre
  return `Fecha ${fecha.numero}`
}

function JornadaFilaVista({
  j,
  onPelotaClick
}: {
  j: JornadaDTO
  onPelotaClick: () => void
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

  return (
    <div className='grid grid-cols-[1fr_1fr_auto] gap-4 text-sm py-1 items-center'>
      <span className={`text-right min-w-0 ${claseEspecial(localLabel)}`}>
        {localLabel}
      </span>
      <span className={`text-left min-w-0 ${claseEspecial(visitanteLabel)}`}>
        {visitanteLabel}
      </span>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground'
        aria-label='Detalle de jornada'
        onClick={onPelotaClick}
      >
        <Icono nombre='Pelota' className='size-5' />
      </Button>
    </div>
  )
}

export interface FechaModoLecturaProps {
  fecha: FechaDTO
  onEditar: () => void
  onEliminar: () => void
  estaCargandoEliminar: boolean
  mostrarBotonEliminar: boolean
}

export function FechaModoLectura({
  fecha,
  onEditar,
  onEliminar,
  estaCargandoEliminar,
  mostrarBotonEliminar
}: FechaModoLecturaProps) {
  const diaDisplay = formatDia(fecha.dia)
  const [modalPelotaAbierto, setModalPelotaAbierto] = useState(false)

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
            onPelotaClick={() => setModalPelotaAbierto(true)}
          />
        ))}
      </div>

      <ModalCargaResultados
        open={modalPelotaAbierto}
        onOpenChange={setModalPelotaAbierto}
      />
    </>
  )
}

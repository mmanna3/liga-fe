import type { JornadaDTO } from '@/api/clients'
import { LocalVisitanteEnum } from '@/api/clients'
import { Button } from '@/design-system/base-ui/button'
import Icono from '@/design-system/ykn-ui/icono'
import ModalEliminacion from '@/design-system/modal-eliminacion'
import { claseEspecial } from '../jornada-edicion'
import type { TorneoFechaDTO } from '@/api/clients'

function formatDia(dia: Date | undefined): string {
  if (!dia) return ''
  return `${dia.getUTCDate()}/${dia.getUTCMonth() + 1}`
}

/** Título visible: instancia (eliminación directa) o número de fecha (todos contra todos). */
export function etiquetaFecha(fecha: TorneoFechaDTO): string {
  const nombre = fecha.instanciaEliminacionDirectaNombre?.trim()
  if (nombre) return nombre
  return `Fecha ${fecha.numero}`
}

function JornadaFilaVista({ j }: { j: JornadaDTO }) {
  let localLabel: string
  let visitanteLabel: string

  if (j.tipo === 'Normal') {
    localLabel = j.local ?? '—'
    visitanteLabel = j.visitante ?? '—'
  } else if (j.tipo === 'Libre') {
    localLabel = j.equipo ?? '—'
    visitanteLabel = 'Libre'
  } else {
    const esLocal = j.localOVisitante !== LocalVisitanteEnum._2
    localLabel = esLocal ? (j.equipo ?? '—') : 'Interzonal'
    visitanteLabel = esLocal ? 'Interzonal' : (j.equipo ?? '—')
  }

  return (
    <div className='grid grid-cols-[1fr_1fr] gap-4 text-sm py-1'>
      <span className={`text-right ${claseEspecial(localLabel)}`}>
        {localLabel}
      </span>
      <span className={`text-left ${claseEspecial(visitanteLabel)}`}>
        {visitanteLabel}
      </span>
    </div>
  )
}

export interface FechaModoLecturaProps {
  fecha: TorneoFechaDTO
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
            <Icono nombre='Editar' className='size-3.5' />
          </Button>
          {mostrarBotonEliminar && (
            <ModalEliminacion
              titulo='Eliminar fecha'
              subtitulo={`¿Confirmás que querés eliminar ${etiquetaFecha(fecha)}? Se eliminarán también todas sus jornadas.`}
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

      <div className='grid grid-cols-[1fr_1fr] gap-4 text-xs font-medium text-muted-foreground mb-1'>
        <span className='text-right'>LOCAL</span>
        <span className='text-left'>VISITANTE</span>
      </div>
      <div className='space-y-1 [&>div:not(:last-child)]:border-b [&>div:not(:last-child)]:border-muted-foreground/10'>
        {(fecha.jornadas ?? []).map((j, i) => (
          <JornadaFilaVista key={i} j={j} />
        ))}
      </div>
    </>
  )
}

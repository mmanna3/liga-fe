import ModalEliminacion from '@/components/modal-eliminacion'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { VisibleSoloParaAdmin } from '@/components/visible-solo-para-admin'
import { cn } from '@/lib/utils'
import { Boton } from '@/components/ykn-ui/boton'
import * as React from 'react'

/** Tipo para íconos de Lucide (ej. FileDown, Pencil, Trash2) */
export type IconoBotoneraTipo = React.ComponentType<{ className?: string }>

export interface IconoBotonera {
  alApretar: () => void
  tooltip: string
  icono: IconoBotoneraTipo
  visibleSoloParaAdmin?: boolean
  esEliminar?: boolean
  /** Requerido cuando esEliminar es true */
  modalEliminacion?: {
    titulo: string
    subtitulo: string
    eliminarTexto: string
    estaCargando?: boolean
  }
}

export interface BotoneraProps {
  iconos: IconoBotonera[]
  /** Contenido que va a la izquierda (ej. título) */
  children?: React.ReactNode
  /** Clase para el BotonVolver cuando FlujoHomeLayout lo renderiza */
  classNameBotonVolver?: string
}

function IconoBoton({ item }: { item: IconoBotonera }) {
  const Icono = item.icono
  const boton = (
    <Boton
      variant='outline'
      className={cn(
        'h-10 w-10 min-w-10 p-0',
        item.esEliminar &&
          'border-destructive text-destructive hover:bg-destructive/10'
      )}
      onClick={item.esEliminar ? undefined : item.alApretar}
      estaCargando={item.modalEliminacion?.estaCargando}
    >
      <Icono className='h-5 w-5 shrink-0' />
    </Boton>
  )

  const tooltipContent = (
    <TooltipContent
      side='bottom'
      className='max-w-xs text-base px-4 py-3'
      sideOffset={8}
    >
      <p>{item.tooltip}</p>
    </TooltipContent>
  )

  if (item.esEliminar) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className='inline-flex'>
            <ModalEliminacion
              titulo={item.modalEliminacion!.titulo}
              subtitulo={item.modalEliminacion!.subtitulo}
              eliminarOnClick={item.alApretar}
              eliminarTexto={item.modalEliminacion!.eliminarTexto}
              trigger={boton}
              estaCargando={item.modalEliminacion?.estaCargando}
            />
          </span>
        </TooltipTrigger>
        {tooltipContent}
      </Tooltip>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{boton}</TooltipTrigger>
      {tooltipContent}
    </Tooltip>
  )
}

export default function Botonera({ iconos, children }: BotoneraProps) {
  return (
    <div className='flex flex-row items-start justify-between gap-4'>
      <div className='flex flex-col gap-2'>{children}</div>
      <div className='flex gap-2 shrink-0'>
        {iconos.map((item, index) => {
          const boton = <IconoBoton key={index} item={item} />
          return item.visibleSoloParaAdmin ? (
            <VisibleSoloParaAdmin key={index}>{boton}</VisibleSoloParaAdmin>
          ) : (
            <React.Fragment key={index}>{boton}</React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

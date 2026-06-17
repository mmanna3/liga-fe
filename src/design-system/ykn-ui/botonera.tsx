import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/design-system/base-ui/tooltip'
import { VisibleSoloParaAdmin } from '@/design-system/visible-solo-para-admin'
import { Boton } from '@/design-system/ykn-ui/boton'
import { BotonEliminar } from '@/design-system/ykn-ui/boton-eliminar'
import Icono, { type NombreIcono } from '@/design-system/ykn-ui/icono'
import * as React from 'react'

export interface IconoBotonera {
  alApretar: () => void
  tooltip: string
  /** Opcional. Para botones eliminar, por defecto 'Eliminar' */
  icono?: NombreIcono
  visibleSoloParaAdmin?: boolean
  /**
   * Botón eliminar: requiere modalEliminacion.
   * - puedeEliminar true (o undefined): muestra modal de confirmación y ejecuta alApretar.
   * - puedeEliminar false: muestra Dialog "No se puede eliminar" con textoNoSePuedeEliminar.
   * Los botones eliminar son siempre visibleSoloParaAdmin.
   */
  puedeEliminar?: boolean
  /** Requerido cuando puedeEliminar es false. Mensaje del Dialog "No se puede eliminar". */
  textoNoSePuedeEliminar?: string
  modalEliminacion?: {
    titulo: string
    subtitulo: string
    /** Opcional. Si no se provee, se usa titulo. */
    eliminarTexto?: string
    estaCargando?: boolean
  }
  /** Opcional. Spinner y botón deshabilitado (p. ej. mutación en curso). */
  estaCargando?: boolean
}

export interface BotoneraProps {
  iconos: IconoBotonera[]
  /** Contenido que va a la izquierda (ej. título) */
  children?: React.ReactNode
  /** Clase para el BotonVolver cuando FlujoHomeLayout lo renderiza */
  classNameBotonVolver?: string
}

function IconoBoton({ item }: { item: IconoBotonera }) {
  const esEliminar = !!item.modalEliminacion

  if (esEliminar) {
    return (
      <BotonEliminar
        onEliminar={item.alApretar}
        titulo={item.modalEliminacion!.titulo}
        subtitulo={item.modalEliminacion!.subtitulo}
        eliminarTexto={
          item.modalEliminacion!.eliminarTexto ?? item.modalEliminacion!.titulo
        }
        estaCargando={item.estaCargando ?? item.modalEliminacion?.estaCargando}
        tooltip={item.tooltip}
        puedeEliminar={item.puedeEliminar}
        textoNoSePuedeEliminar={item.textoNoSePuedeEliminar}
        compacto
      />
    )
  }

  const iconoNombre: NombreIcono = item.icono ?? 'Editar'

  const boton = (
    <Boton
      variant='outline'
      aria-label={item.tooltip}
      className='h-8 w-8 min-w-8 p-0 border-none shadow-none'
      onClick={item.alApretar}
      estaCargando={item.estaCargando}
    >
      <Icono nombre={iconoNombre} className='h-5 w-5 shrink-0' />
    </Boton>
  )

  return (
    <Tooltip>
      <TooltipTrigger asChild>{boton}</TooltipTrigger>
      <TooltipContent
        side='bottom'
        className='max-w-xs text-base px-4 py-3'
        sideOffset={8}
      >
        <p>{item.tooltip}</p>
      </TooltipContent>
    </Tooltip>
  )
}

export default function Botonera({ iconos, children }: BotoneraProps) {
  return (
    <div className='flex flex-row items-start justify-between gap-4 print:hidden'>
      <div className='flex flex-col gap-2'>{children}</div>
      <div className='flex gap-0 shrink-0 mt-1'>
        {iconos.map((item, index) => {
          const boton = <IconoBoton key={index} item={item} />
          const esEliminar = !!item.modalEliminacion
          const visibleSoloAdmin = item.visibleSoloParaAdmin ?? esEliminar
          return visibleSoloAdmin && !esEliminar ? (
            <VisibleSoloParaAdmin key={index}>{boton}</VisibleSoloParaAdmin>
          ) : (
            <React.Fragment key={index}>{boton}</React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/design-system/base-ui/alert-dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/design-system/base-ui/tooltip'
import ModalEliminacion from '@/design-system/modal-eliminacion'
import { VisibleSoloParaAdmin } from '@/design-system/visible-solo-para-admin'
import { Boton } from '@/design-system/ykn-ui/boton'
import Icono, { type NombreIcono } from '@/design-system/ykn-ui/icono'
import { cn } from '@/logica-compartida/utils'
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
  const puedeEliminar = item.puedeEliminar !== false
  const [abrirNoSePuede, setAbrirNoSePuede] = React.useState(false)

  const iconoNombre: NombreIcono =
    item.icono ?? (esEliminar ? 'Eliminar' : 'Editar')

  const boton = (
    <Boton
      variant='outline'
      aria-label={item.tooltip}
      className={cn(
        'h-8 w-8 min-w-8 p-0 border-none shadow-none',
        esEliminar &&
          puedeEliminar &&
          'border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive'
      )}
      onClick={
        esEliminar && !puedeEliminar
          ? () => setAbrirNoSePuede(true)
          : esEliminar
            ? undefined
            : item.alApretar
      }
      estaCargando={item.estaCargando ?? item.modalEliminacion?.estaCargando}
    >
      <Icono nombre={iconoNombre} className='h-5 w-5 shrink-0' />
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

  if (esEliminar && puedeEliminar) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className='inline-flex'>
            <ModalEliminacion
              titulo={item.modalEliminacion!.titulo}
              subtitulo={item.modalEliminacion!.subtitulo}
              eliminarOnClick={item.alApretar}
              eliminarTexto={
                item.modalEliminacion!.eliminarTexto ??
                item.modalEliminacion!.titulo
              }
              trigger={boton}
              estaCargando={item.modalEliminacion?.estaCargando}
            />
          </span>
        </TooltipTrigger>
        {tooltipContent}
      </Tooltip>
    )
  }

  if (esEliminar && !puedeEliminar) {
    return (
      <>
        <Tooltip>
          <TooltipTrigger asChild>{boton}</TooltipTrigger>
          {tooltipContent}
        </Tooltip>
        <AlertDialog open={abrirNoSePuede} onOpenChange={setAbrirNoSePuede}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>No se puede eliminar</AlertDialogTitle>
              <AlertDialogDescription>
                {item.textoNoSePuedeEliminar ??
                  'No se puede realizar esta acción.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Volver</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
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
      <div className='flex gap-0 shrink-0 mt-1'>
        {iconos.map((item, index) => {
          const boton = <IconoBoton key={index} item={item} />
          const esEliminar = !!item.modalEliminacion
          const visibleSoloAdmin = item.visibleSoloParaAdmin ?? esEliminar
          return visibleSoloAdmin ? (
            <VisibleSoloParaAdmin key={index}>{boton}</VisibleSoloParaAdmin>
          ) : (
            <React.Fragment key={index}>{boton}</React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

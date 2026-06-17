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
import { Boton } from '@/design-system/ykn-ui/boton'
import Icono from '@/design-system/ykn-ui/icono'
import { useAuth } from '@/logica-compartida/hooks/use-auth'
import { cn } from '@/logica-compartida/utils'
import * as React from 'react'

export type BotonEliminarVariant = 'icono' | 'ghost' | 'texto-destructivo'

export interface BotonEliminarProps {
  onEliminar: () => void
  titulo: string
  subtitulo: string
  eliminarTexto?: string
  estaCargando?: boolean
  tooltip?: string
  variant?: BotonEliminarVariant
  puedeEliminar?: boolean
  textoNoSePuedeEliminar?: string
  className?: string
  trigger?: React.ReactNode
  /** Estilo compacto para botoneras de header (h-8 w-8) */
  compacto?: boolean
}

function TriggerPorDefecto({
  variant,
  compacto,
  tooltip,
  eliminarTexto,
  estaCargando,
  className,
  onClick
}: {
  variant: BotonEliminarVariant
  compacto: boolean
  tooltip: string
  eliminarTexto: string
  estaCargando?: boolean
  className?: string
  onClick?: () => void
}) {
  if (variant === 'texto-destructivo') {
    return (
      <Boton
        type='button'
        variant='outline'
        className={cn(
          'border-destructive text-destructive hover:bg-destructive/10',
          className
        )}
        aria-label={tooltip}
        estaCargando={estaCargando}
        onClick={onClick}
      >
        {eliminarTexto}
      </Boton>
    )
  }

  if (variant === 'ghost') {
    return (
      <Boton
        type='button'
        variant='ghost'
        size='icon'
        className={cn(
          'shrink-0 text-muted-foreground hover:text-destructive',
          compacto ? 'h-7 w-7' : 'h-8 w-8',
          className
        )}
        aria-label={tooltip}
        disabled={estaCargando}
        onClick={onClick}
      >
        <Icono nombre='Eliminar' className={compacto ? 'size-3.5' : 'size-4'} />
        <span className='sr-only'>{tooltip}</span>
      </Boton>
    )
  }

  return (
    <Boton
      type='button'
      variant='outline'
      aria-label={tooltip}
      className={cn(
        compacto
          ? 'h-8 w-8 min-w-8 p-0 border-none shadow-none border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive'
          : 'h-10 w-10 border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive',
        className
      )}
      estaCargando={estaCargando}
      onClick={onClick}
    >
      <Icono nombre='Eliminar' className='h-5 w-5 shrink-0' />
    </Boton>
  )
}

export function BotonEliminar({
  onEliminar,
  titulo,
  subtitulo,
  eliminarTexto = 'Eliminar',
  estaCargando = false,
  tooltip = 'Eliminar',
  variant = 'icono',
  puedeEliminar = true,
  textoNoSePuedeEliminar,
  className,
  trigger,
  compacto = false
}: BotonEliminarProps) {
  const esAdmin = useAuth((state) => state.esAdmin)
  const [abrirNoSePuede, setAbrirNoSePuede] = React.useState(false)

  if (!esAdmin()) {
    return null
  }

  const triggerElement = trigger ?? (
    <TriggerPorDefecto
      variant={variant}
      compacto={compacto}
      tooltip={tooltip}
      eliminarTexto={eliminarTexto}
      estaCargando={estaCargando}
      className={className}
      onClick={!puedeEliminar ? () => setAbrirNoSePuede(true) : undefined}
    />
  )

  const tooltipContent = (
    <TooltipContent
      side='bottom'
      className='max-w-xs text-base px-4 py-3'
      sideOffset={8}
    >
      <p>{tooltip}</p>
    </TooltipContent>
  )

  if (!puedeEliminar) {
    return (
      <>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className='inline-flex'>{triggerElement}</span>
          </TooltipTrigger>
          {tooltipContent}
        </Tooltip>
        <AlertDialog open={abrirNoSePuede} onOpenChange={setAbrirNoSePuede}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>No se puede eliminar</AlertDialogTitle>
              <AlertDialogDescription>
                {textoNoSePuedeEliminar ?? 'No se puede realizar esta acción.'}
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
      <TooltipTrigger asChild>
        <span className='inline-flex'>
          <ModalEliminacion
            titulo={titulo}
            subtitulo={subtitulo}
            eliminarOnClick={onEliminar}
            eliminarTexto={eliminarTexto}
            trigger={triggerElement}
            estaCargando={estaCargando}
          />
        </span>
      </TooltipTrigger>
      {tooltipContent}
    </Tooltip>
  )
}

import { TipoDeFaseEnum, type FaseDTO } from '@/api/clients'
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
import SelectorSimple from '@/design-system/ykn-ui/selector-simple'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DatosFaseLectura } from '../../../crear-torneo/components/datos-fase-lectura'
import { TituloFase } from '../../../crear-torneo/components/titulo-fase'
import {
  OPCIONES_FORMATO,
  tipoDeFaseNombreDesdeEnum,
  type FaseEstado
} from '../../lib'
import { useFaseItem } from './use-fase-item'

interface FaseItemProps {
  torneoId: number
  fase: FaseEstado
  faseIndex: number
  faseOriginal?: FaseDTO
  onActualizar: (campo: string, valor: string) => void
  onEliminar: () => void
  /** Si se provee, se llama al hacer clic en el ícono de zonas (guarda antes de navegar). Recibe el index de la fase. */
  onIrAZonas?: (faseIndex: number) => void
  /** Muestra loading en el botón de zonas mientras se guarda */
  estaGuardando?: boolean
  /** Si true, no muestra borde superior ni padding extra (para uso dentro de Card) */
  enCard?: boolean
}

export function FaseItem({
  torneoId,
  fase,
  faseIndex,
  faseOriginal,
  onActualizar,
  onEliminar,
  onIrAZonas,
  estaGuardando = false,
  enCard = false
}: FaseItemProps) {
  const navigate = useNavigate()
  const [mostrarNoSePuedeEliminar, setMostrarNoSePuedeEliminar] =
    useState(false)
  const { cambiarNombreMutation, cambiarFormatoMutation } = useFaseItem({
    torneoId,
    faseOriginal
  })

  const faseId = fase.id ?? 0
  const pathZonas = `${rutasNavegacion.detalleTorneo}/${torneoId}/fases/${faseId}/zonas`

  const esEliminacionDirecta =
    faseOriginal?.tipoDeFase === TipoDeFaseEnum._2 ||
    fase.formato === 'eliminacion-directa'
  const tieneZonas = (faseOriginal?.zonas?.length ?? 0) > 0
  /** Con zonas, el formato no se edita (en ED el backend a veces sigue marcando la fase como editable). */
  const formatoYLecturaZonas =
    !fase.sePuedeEditar || (esEliminacionDirecta && tieneZonas)

  const botonZonas = (
    <Tooltip>
      <TooltipTrigger asChild>
        <Boton
          type='button'
          variant='outline'
          className='h-10 w-10 min-w-10 p-0 border-none'
          estaCargando={estaGuardando}
          aria-label='Zonas de la fase'
          onClick={() =>
            onIrAZonas ? onIrAZonas(faseIndex) : navigate(pathZonas)
          }
        >
          <Icono nombre='Zonas' className='h-5 w-5 shrink-0' />
        </Boton>
      </TooltipTrigger>
      <TooltipContent
        side='bottom'
        className='max-w-xs px-4 py-3'
        sideOffset={8}
      >
        <p>Zonas de la fase</p>
      </TooltipContent>
    </Tooltip>
  )

  const botonEliminar = (
    <Boton
      type='button'
      variant='outline'
      className={
        fase.sePuedeEditar
          ? 'h-10 w-10 min-w-10 p-0 border-none text-destructive hover:bg-destructive/10 hover:text-destructive'
          : 'h-10 w-10 min-w-10 p-0 border-none hover:bg-muted/50 hover:text-muted-foreground'
      }
      onClick={
        fase.sePuedeEditar ? undefined : () => setMostrarNoSePuedeEliminar(true)
      }
    >
      <Icono nombre='Eliminar' className='h-5 w-5 shrink-0' />
    </Boton>
  )

  return (
    <div className={enCard ? 'space-y-2' : 'space-y-2 pt-6 border-t'}>
      <div className='flex items-start justify-between gap-2'>
        <TituloFase
          numero={fase.numero}
          valor={fase.nombre}
          alCambiar={(v: string) => onActualizar('nombre', v)}
          alConfirmar={(v: string) => cambiarNombreMutation.mutate(v)}
          soloLectura={false}
        />
        <div className='flex gap-2 shrink-0'>
          {botonZonas}
          {fase.sePuedeEditar ? (
            <ModalEliminacion
              titulo='Eliminar fase'
              subtitulo={`¿Estás seguro de que querés eliminar la fase "${fase.nombre}"?`}
              eliminarOnClick={onEliminar}
              eliminarTexto='Eliminar'
              trigger={botonEliminar}
            />
          ) : (
            botonEliminar
          )}
        </div>
      </div>

      {formatoYLecturaZonas ? (
        <DatosFaseLectura
          zonas={faseOriginal?.zonas ?? []}
          formato={
            faseOriginal?.tipoDeFaseNombre ??
            tipoDeFaseNombreDesdeEnum(faseOriginal?.tipoDeFase)
          }
          torneoId={torneoId}
          faseId={faseId}
        />
      ) : (
        <SelectorSimple
          titulo=''
          opciones={OPCIONES_FORMATO}
          valorActual={fase.formato}
          alElegirOpcion={(v) => {
            onActualizar('formato', v)
            cambiarFormatoMutation.mutate(v)
          }}
        />
      )}

      <AlertDialog
        open={mostrarNoSePuedeEliminar}
        onOpenChange={(open) => !open && setMostrarNoSePuedeEliminar(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>No se puede eliminar</AlertDialogTitle>
            <AlertDialogDescription>
              Esta fase no se puede eliminar. Para eliminarla, eliminá primero
              todas sus zonas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

import { TorneoFaseDTO } from '@/api/clients'
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
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { rutasNavegacion } from '@/ruteo/rutas'
import { DatosFaseLectura } from '../crear-torneo/components/datos-fase-lectura'
import { TituloFase } from '../crear-torneo/components/titulo-fase'
import {
  OPCIONES_EXCLUYENTE,
  OPCIONES_FORMATO,
  formatoNombreDesdeId,
  type FaseEstado
} from './lib'

interface FaseItemProps {
  torneoId: number
  fase: FaseEstado
  faseOriginal?: TorneoFaseDTO
  onActualizar: (campo: string, valor: string) => void
  onEliminar: () => void
}

export function FaseItem({
  torneoId,
  fase,
  faseOriginal,
  onActualizar,
  onEliminar
}: FaseItemProps) {
  const navigate = useNavigate()
  const [mostrarNoSePuedeEliminar, setMostrarNoSePuedeEliminar] =
    useState(false)

  const faseId = fase.id ?? 0
  const pathZonas = `${rutasNavegacion.detalleTorneo}/${torneoId}/fases/${faseId}/zonas`

  const botonZonas = (
    <Tooltip>
      <TooltipTrigger asChild>
        <Boton
          type='button'
          variant='outline'
          className='h-10 w-10 min-w-10 p-0'
          onClick={() => navigate(pathZonas)}
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
      className='h-10 w-10 min-w-10 p-0 border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive'
      onClick={
        fase.sePuedeEditar ? undefined : () => setMostrarNoSePuedeEliminar(true)
      }
    >
      <Icono nombre='Eliminar' className='h-5 w-5 shrink-0' />
    </Boton>
  )

  return (
    <div className='space-y-4 pt-6 border-t'>
      <div className='flex items-start justify-between gap-2'>
        <TituloFase
          numero={fase.numero}
          valor={fase.nombre}
          alCambiar={(v) => onActualizar('nombre', v)}
          soloLectura={!fase.sePuedeEditar}
        />
        <div className='flex gap-2 shrink-0'>
          {faseId > 0 && botonZonas}
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

      {fase.sePuedeEditar ? (
        <>
          <SelectorSimple
            titulo='Formato'
            opciones={OPCIONES_FORMATO}
            valorActual={fase.formato}
            alElegirOpcion={(v) => onActualizar('formato', v)}
          />
          <SelectorSimple
            titulo='Excluyente'
            opciones={OPCIONES_EXCLUYENTE}
            valorActual={fase.excluyente}
            alElegirOpcion={(v) => onActualizar('excluyente', v)}
          />
        </>
      ) : (
        <DatosFaseLectura
          formato={
            faseOriginal?.faseFormatoNombre ??
            formatoNombreDesdeId(faseOriginal?.faseFormatoId)
          }
          excluyente={
            faseOriginal?.esExcluyente
              ? 'Fase excluyente'
              : 'Fase no excluyente'
          }
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
              Esta fase no se puede eliminar.
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

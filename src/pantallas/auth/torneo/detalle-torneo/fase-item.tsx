import { api } from '@/api/api'
import { TorneoFaseDTO } from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
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
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DatosFaseLectura } from '../crear-torneo/components/datos-fase-lectura'
import { TituloFase } from '../crear-torneo/components/titulo-fase'
import { OPCIONES_FORMATO, formatoNombreDesdeId, type FaseEstado } from './lib'

interface FaseItemProps {
  torneoId: number
  fase: FaseEstado
  faseIndex: number
  faseOriginal?: TorneoFaseDTO
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
  const queryClient = useQueryClient()
  const [mostrarNoSePuedeEliminar, setMostrarNoSePuedeEliminar] =
    useState(false)

  const cambiarNombreMutation = useApiMutation<string>({
    fn: async (nuevoNombre) => {
      if (!faseOriginal?.id) return
      await api.fasesPUT(
        torneoId,
        faseOriginal.id,
        new TorneoFaseDTO({ ...faseOriginal, nombre: nuevoNombre, torneoId })
      )
    },
    antesDeMensajeExito: () => {
      queryClient.invalidateQueries({ queryKey: ['torneo'] })
    },
    mensajeDeExito: 'Nombre actualizado'
  })

  const cambiarFormatoMutation = useApiMutation<string>({
    fn: async (nuevoFormato) => {
      if (!faseOriginal?.id) return
      await api.fasesPUT(
        torneoId,
        faseOriginal.id,
        new TorneoFaseDTO({
          ...faseOriginal,
          faseFormatoId: nuevoFormato === 'todos-contra-todos' ? 1 : 2,
          torneoId
        })
      )
    },
    antesDeMensajeExito: () => {
      queryClient.invalidateQueries({ queryKey: ['torneo'] })
    },
    mensajeDeExito: 'Formato actualizado'
  })

  const faseId = fase.id ?? 0
  const pathZonas = `${rutasNavegacion.detalleTorneo}/${torneoId}/fases/${faseId}/zonas`

  const botonZonas = (
    <Tooltip>
      <TooltipTrigger asChild>
        <Boton
          type='button'
          variant='outline'
          className='h-10 w-10 min-w-10 p-0'
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
      className='h-10 w-10 min-w-10 p-0 border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive'
      onClick={
        fase.sePuedeEditar ? undefined : () => setMostrarNoSePuedeEliminar(true)
      }
    >
      <Icono nombre='Eliminar' className='h-5 w-5 shrink-0' />
    </Boton>
  )

  return (
    <div className={enCard ? 'space-y-4' : 'space-y-4 pt-6 border-t'}>
      <div className='flex items-start justify-between gap-2'>
        <TituloFase
          numero={fase.numero}
          valor={fase.nombre}
          alCambiar={(v) => onActualizar('nombre', v)}
          alConfirmar={(v) => cambiarNombreMutation.mutate(v)}
          soloLectura={!fase.sePuedeEditar}
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

      {fase.sePuedeEditar ? (
        <SelectorSimple
          titulo='Formato'
          opciones={OPCIONES_FORMATO}
          valorActual={fase.formato}
          alElegirOpcion={(v) => {
            onActualizar('formato', v)
            cambiarFormatoMutation.mutate(v)
          }}
        />
      ) : (
        <DatosFaseLectura
          zonas={faseOriginal?.zonas ?? []}
          formato={
            faseOriginal?.faseFormatoNombre ??
            formatoNombreDesdeId(faseOriginal?.faseFormatoId)
          }
          torneoId={torneoId}
          faseId={faseId}
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

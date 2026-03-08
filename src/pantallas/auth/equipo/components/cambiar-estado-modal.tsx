import { api } from '@/api/api'
import { CambiarEstadoDelJugadorDTO, EquipoDTO } from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import { Boton } from '@/design-system/ykn-ui/boton'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/design-system/base-ui/dialog'
import { Textarea } from '@/design-system/base-ui/textarea'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

interface CambiarEstadoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  equipo: EquipoDTO
  selectedJugadores: number[]
}

export default function CambiarEstadoModal({
  open,
  onOpenChange,
  equipo,
  selectedJugadores
}: CambiarEstadoModalProps) {
  const queryClient = useQueryClient()
  const [motivo, setMotivo] = useState('')

  useEffect(() => {
    if (!open) setMotivo('')
  }, [open])

  const onSuccess = () => {
    onOpenChange(false)
    queryClient.invalidateQueries({
      queryKey: ['equipo', equipo.id?.toString()]
    })
  }

  const suspenderMutation = useApiMutation({
    fn: async (dtos: CambiarEstadoDelJugadorDTO[]) => {
      const resultado = await api.suspenderJugador(dtos)
      if (resultado <= 0) {
        throw new Error('No se pudo realizar el cambio de estado')
      }
      return resultado
    },
    antesDeMensajeExito: onSuccess,
    mensajeDeExito: 'Jugadores suspendidos exitosamente'
  })

  const inhabilitarMutation = useApiMutation({
    fn: async (dtos: CambiarEstadoDelJugadorDTO[]) => {
      const resultado = await api.inhabilitarJugador(dtos)
      if (resultado <= 0) {
        throw new Error('No se pudo realizar el cambio de estado')
      }
      return resultado
    },
    antesDeMensajeExito: onSuccess,
    mensajeDeExito: 'Jugadores inhabilitados exitosamente'
  })

  const activarMutation = useApiMutation({
    fn: async (dtos: CambiarEstadoDelJugadorDTO[]) => {
      const resultado = await api.activarJugador(dtos)
      if (resultado <= 0) {
        throw new Error('No se pudo realizar el cambio de estado')
      }
      return resultado
    },
    antesDeMensajeExito: onSuccess,
    mensajeDeExito: 'Jugadores activados exitosamente'
  })

  const handleAction = (
    mutation:
      | typeof suspenderMutation
      | typeof inhabilitarMutation
      | typeof activarMutation
  ) => {
    if (selectedJugadores.length === 0 || !equipo?.jugadores) return

    const jugadores = equipo.jugadores
    const dtos = selectedJugadores
      .map((jugadorEquipoId) => {
        const jugador = jugadores.find((j) => j.id === jugadorEquipoId)
        if (!jugador) return null

        return new CambiarEstadoDelJugadorDTO({
          jugadorId: jugador.id,
          jugadorEquipoId: jugador.jugadorEquipoId,
          motivo
        })
      })
      .filter((dto): dto is CambiarEstadoDelJugadorDTO => dto !== null)

    mutation.mutate(dtos)
  }

  const isPending =
    suspenderMutation.isPending ||
    inhabilitarMutation.isPending ||
    activarMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Cambiar estado</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <label htmlFor='motivo' className='text-sm font-medium'>
              Motivo
            </label>
            <Textarea
              id='motivo'
              placeholder='Escribí el motivo de este cambio de estado...'
              rows={4}
              className='w-full'
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className='flex-row justify-between w-full sm:justify-between'>
          <Boton variant='outline' onClick={() => onOpenChange(false)}>
            Volver
          </Boton>
          <div className='flex gap-2'>
            <Boton
              variant='destructive'
              onClick={() => handleAction(inhabilitarMutation)}
              disabled={selectedJugadores.length === 0 || !motivo}
              estaCargando={isPending}
            >
              Inhabilitar
            </Boton>
            <Boton
              variant='destructive'
              onClick={() => handleAction(suspenderMutation)}
              disabled={selectedJugadores.length === 0 || !motivo}
              estaCargando={isPending}
            >
              Suspender
            </Boton>
            <Boton
              onClick={() => handleAction(activarMutation)}
              disabled={selectedJugadores.length === 0 || !motivo}
              estaCargando={isPending}
            >
              Activar
            </Boton>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

import { api } from '@/api/api'
import { EfectuarPaseDTO, EquipoDTO } from '@/api/clients'
import useApiQuery from '@/api/hooks/use-api-query'
import useApiMutation from '@/api/hooks/use-api-mutation'
import { Button } from '@/ui/base-ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/ui/base-ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/ui/base-ui/select'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

interface EfectuarPasesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  equipo: EquipoDTO
  selectedJugadores: number[]
}

export default function EfectuarPasesModal({
  open,
  onOpenChange,
  equipo,
  selectedJugadores
}: EfectuarPasesModalProps) {
  const queryClient = useQueryClient()
  const [equipoDestinoId, setEquipoDestinoId] = useState<string>('')

  useEffect(() => {
    if (!open) setEquipoDestinoId('')
  }, [open])

  const { data: equipos } = useApiQuery<EquipoDTO[]>({
    key: ['equipos'],
    fn: async () => {
      const response = await api.equipoAll()
      return response
    },
    activado: open
  })

  const efectuarPasesMutation = useApiMutation({
    fn: async (dtos: EfectuarPaseDTO[]) => {
      const resultado = await api.efectuarPases(dtos)
      if (resultado <= 0) {
        throw new Error('No se pudo realizar el pase')
      }
      return resultado
    },
    antesDeMensajeExito: () => {
      onOpenChange(false)
      queryClient.invalidateQueries({
        queryKey: ['equipo', equipo.id?.toString()]
      })
    },
    mensajeDeExito: 'Pases efectuados exitosamente'
  })

  const handleEfectuarPase = () => {
    if (
      selectedJugadores.length === 0 ||
      !equipo?.jugadores ||
      !equipoDestinoId
    )
      return

    const jugadores = equipo.jugadores
    const dtos = selectedJugadores
      .map((jugadorEquipoId) => {
        const jugador = jugadores.find((j) => j.id === jugadorEquipoId)
        if (!jugador) return null

        return new EfectuarPaseDTO({
          jugadorId: jugador.id,
          equipoDestinoId: Number(equipoDestinoId),
          equipoOrigenId: equipo.id
        })
      })
      .filter((dto): dto is EfectuarPaseDTO => dto !== null)

    efectuarPasesMutation.mutate(dtos)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Efectuar pases</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <label htmlFor='equipoDestinoId' className='text-sm font-medium'>
              Equipo destino
            </label>
            <Select
              value={equipoDestinoId}
              onValueChange={setEquipoDestinoId}
              required
            >
              <SelectTrigger id='equipoDestinoId'>
                <SelectValue placeholder='Seleccionar equipo destino' />
              </SelectTrigger>
              <SelectContent>
                {(equipos ?? [])
                  .filter((e: EquipoDTO) => e.id !== equipo?.id)
                  .map((e: EquipoDTO) => (
                    <SelectItem key={e.id} value={e.id!.toString()}>
                      {e.nombre}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Volver
          </Button>
          <Button
            onClick={handleEfectuarPase}
            disabled={
              selectedJugadores.length === 0 ||
              !equipoDestinoId ||
              efectuarPasesMutation.isPending
            }
          >
            {efectuarPasesMutation.isPending
              ? 'Procesando...'
              : 'Efectuar pase'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

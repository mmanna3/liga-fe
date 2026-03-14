import { api } from '@/api/api'
import { EfectuarPaseDTO, EquipoDTO } from '@/api/clients'
import useApiQuery from '@/api/hooks/use-api-query'
import useApiMutation from '@/api/hooks/use-api-mutation'
import { Boton } from '@/design-system/ykn-ui/boton'
import { DialogFooter } from '@/design-system/base-ui/dialog'
import ModalConAccion from '@/design-system/ykn-ui/modal-con-accion'
import { ListaDesplegable } from '@/design-system/ykn-ui/lista-desplegable'
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

  const opcionesEquipos = (equipos ?? [])
    .filter((e: EquipoDTO) => e.id !== equipo?.id)
    .map((e: EquipoDTO) => ({
      value: e.id!.toString(),
      label: e.nombre ?? ''
    }))

  return (
    <ModalConAccion
      titulo='Efectuar pases'
      open={open}
      onOpenChange={onOpenChange}
    >
      <div className='space-y-4'>
        <ListaDesplegable
          titulo='Equipo destino'
          id='equipoDestinoId'
          opciones={opcionesEquipos}
          valor={equipoDestinoId}
          alCambiar={setEquipoDestinoId}
          placeholder='Seleccionar equipo destino'
          requerido
        />
      </div>
      <DialogFooter>
        <Boton variant='outline' onClick={() => onOpenChange(false)}>
          Volver
        </Boton>
        <Boton
          onClick={handleEfectuarPase}
          disabled={selectedJugadores.length === 0 || !equipoDestinoId}
          estaCargando={efectuarPasesMutation.isPending}
        >
          Efectuar pase
        </Boton>
      </DialogFooter>
    </ModalConAccion>
  )
}

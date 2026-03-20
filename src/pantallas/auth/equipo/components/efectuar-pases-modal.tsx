import { api } from '@/api/api'
import { EfectuarPaseDTO, EquipoDTO } from '@/api/clients'
import useApiQuery from '@/api/hooks/use-api-query'
import useApiMutation from '@/api/hooks/use-api-mutation'
import { Input } from '@/design-system/base-ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/design-system/base-ui/popover'
import { Boton } from '@/design-system/ykn-ui/boton'
import { DialogFooter } from '@/design-system/base-ui/dialog'
import { Label } from '@/design-system/base-ui/label'
import ModalConAccion from '@/design-system/ykn-ui/modal-con-accion'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'

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

  const equiposDisponibles = useMemo(
    () => (equipos ?? []).filter((e: EquipoDTO) => e.id !== equipo?.id),
    [equipos, equipo?.id]
  )

  const [busquedaEquipo, setBusquedaEquipo] = useState('')
  const [popoverAbierto, setPopoverAbierto] = useState(false)

  useEffect(() => {
    if (!open) setBusquedaEquipo('')
  }, [open])

  const equiposFiltrados = useMemo(() => {
    const t = busquedaEquipo.trim().toLowerCase()
    if (!t) return equiposDisponibles
    return equiposDisponibles.filter(
      (e) => e.nombre?.toLowerCase().includes(t) ?? false
    )
  }, [equiposDisponibles, busquedaEquipo])

  const equipoSeleccionado = equiposDisponibles.find(
    (e) => e.id?.toString() === equipoDestinoId
  )
  const textoTrigger =
    equipoSeleccionado?.nombre ?? 'Buscar equipo por nombre...'

  return (
    <ModalConAccion
      titulo='Efectuar pases'
      open={open}
      onOpenChange={onOpenChange}
    >
      <div className='space-y-4'>
        <div>
          <Label
            htmlFor='equipo-destino'
            className='block mb-2 text-md font-semibold'
          >
            Equipo destino
          </Label>
          <Popover
            open={popoverAbierto}
            onOpenChange={(open) => {
              setPopoverAbierto(open)
              if (!open) setBusquedaEquipo('')
            }}
          >
            <PopoverTrigger asChild>
              <button
                id='equipo-destino'
                type='button'
                className='flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-left'
              >
                <span
                  className={
                    equipoDestinoId
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }
                >
                  {textoTrigger}
                </span>
                <span className='ml-2 shrink-0 opacity-50'>▼</span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              className='w-(--radix-popover-trigger-width) p-0'
              align='start'
            >
              <Input
                placeholder='Escribí el nombre del equipo...'
                value={busquedaEquipo}
                onChange={(e) => setBusquedaEquipo(e.target.value)}
                className='rounded-b-none border-0 border-b rounded-t-md h-10'
                autoFocus
              />
              <div className='max-h-48 overflow-y-auto p-1'>
                {equiposFiltrados.map((e) => (
                  <button
                    key={e.id}
                    type='button'
                    className='w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none'
                    onClick={() => {
                      setEquipoDestinoId(e.id!.toString())
                      setPopoverAbierto(false)
                      setBusquedaEquipo('')
                    }}
                  >
                    {e.nombre ?? ''}
                  </button>
                ))}
                {equiposFiltrados.length === 0 && (
                  <p className='text-sm text-muted-foreground py-4 text-center'>
                    No hay equipos que coincidan
                  </p>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
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

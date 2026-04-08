import { api } from '@/api/api'
import { ActualizarTarjetasJugadorDTO } from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/design-system/base-ui/dialog'
import { Input } from '@/design-system/base-ui/input'
import { Label } from '@/design-system/base-ui/label'
import { Boton } from '@/design-system/ykn-ui/boton'
import { cn } from '@/logica-compartida/utils'
import { useEffect, useState } from 'react'

const MAX_DIBUJADAS = 10

function TarjetaMini({
  variante
}: {
  variante: 'amarilla' | 'roja' | 'vacia'
}) {
  if (variante === 'vacia') {
    return (
      <div
        className='h-7 w-5 shrink-0 rounded-[3px] border-2 border-dashed border-gray-300 bg-gray-50'
        aria-hidden
      />
    )
  }
  return (
    <div
      className={cn(
        'h-7 w-5 shrink-0 rounded-[3px] border shadow-sm',
        variante === 'amarilla' && 'border-amber-700/50 bg-amber-300',
        variante === 'roja' && 'border-red-900/40 bg-red-600'
      )}
      aria-hidden
    />
  )
}

function GrupoTarjetasDibujadas({
  cantidad,
  variante
}: {
  cantidad: number
  variante: 'amarilla' | 'roja'
}) {
  const mostrar = Math.min(cantidad, MAX_DIBUJADAS)
  const resto = cantidad > MAX_DIBUJADAS ? cantidad - MAX_DIBUJADAS : 0

  return (
    <div className='flex items-center gap-2'>
      <div className='flex flex-wrap gap-0.5'>
        {cantidad === 0 ? (
          <TarjetaMini variante='vacia' />
        ) : (
          Array.from({ length: mostrar }).map((_, i) => (
            <TarjetaMini key={i} variante={variante} />
          ))
        )}
      </div>
      {resto > 0 && (
        <span className='text-xs font-medium text-muted-foreground'>
          +{resto}
        </span>
      )}
      <span className='min-w-[1.5ch] text-lg font-semibold tabular-nums text-gray-900'>
        {cantidad}
      </span>
    </div>
  )
}

export function TarjetasJugadorResumenClickeable({
  amarillas,
  rojas,
  onClick,
  className
}: {
  amarillas: number
  rojas: number
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'mt-2 flex w-full flex-col items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-left transition-colors hover:border-gray-200 hover:bg-gray-50/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        className
      )}
    >
      <div className='flex flex-wrap items-center justify-center gap-x-6 gap-y-2'>
        <div className='flex flex-col items-center gap-1.5'>
          <span className='text-xs text-gray-600'>Amarillas</span>
          <GrupoTarjetasDibujadas cantidad={amarillas} variante='amarilla' />
        </div>
        <div className='flex flex-col items-center gap-1.5'>
          <span className='text-xs text-gray-600'>Rojas</span>
          <GrupoTarjetasDibujadas cantidad={rojas} variante='roja' />
        </div>
      </div>
    </button>
  )
}

interface ModalActualizarTarjetasProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  jugadorEquipoId: number
  tarjetasAmarillasInicial: number
  tarjetasRojasInicial: number
  onGuardado: () => void
}

export default function ModalActualizarTarjetas({
  open,
  onOpenChange,
  jugadorEquipoId,
  tarjetasAmarillasInicial,
  tarjetasRojasInicial,
  onGuardado
}: ModalActualizarTarjetasProps) {
  const [amarillas, setAmarillas] = useState(tarjetasAmarillasInicial)
  const [rojas, setRojas] = useState(tarjetasRojasInicial)

  useEffect(() => {
    if (open) {
      setAmarillas(tarjetasAmarillasInicial)
      setRojas(tarjetasRojasInicial)
    }
  }, [open, tarjetasAmarillasInicial, tarjetasRojasInicial])

  const mutation = useApiMutation({
    fn: async (dto: ActualizarTarjetasJugadorDTO) => {
      await api.actualizarTarjetas(dto)
    },
    mensajeDeExito: 'Las tarjetas se actualizaron correctamente.',
    antesDeMensajeExito: () => {
      onOpenChange(false)
      onGuardado()
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(
      new ActualizarTarjetasJugadorDTO({
        jugadorEquipoId,
        tarjetasAmarillas: amarillas,
        tarjetasRojas: rojas
      })
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Actualizar tarjetas</DialogTitle>
          </DialogHeader>
          <div className='grid grid-cols-2 gap-4 py-2'>
            <div className='grid min-w-0 gap-2'>
              <Label htmlFor='tarjetas-amarillas'>Tarjetas amarillas</Label>
              <Input
                id='tarjetas-amarillas'
                type='number'
                min={0}
                step={1}
                value={amarillas}
                onChange={(e) => setAmarillas(Number(e.target.value) || 0)}
              />
            </div>
            <div className='grid min-w-0 gap-2'>
              <Label htmlFor='tarjetas-rojas'>Tarjetas rojas</Label>
              <Input
                id='tarjetas-rojas'
                type='number'
                min={0}
                step={1}
                value={rojas}
                onChange={(e) => setRojas(Number(e.target.value) || 0)}
              />
            </div>
          </div>
          <DialogFooter>
            <Boton
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Boton>
            <Boton type='submit' estaCargando={mutation.isPending}>
              Guardar
            </Boton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

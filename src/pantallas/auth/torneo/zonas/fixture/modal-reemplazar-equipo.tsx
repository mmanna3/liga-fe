import type { EquipoDeLaZonaDTO } from '@/api/clients'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/design-system/base-ui/dialog'

export function ModalReemplazarEquipo({
  abierto,
  onCerrar,
  equipos,
  nombreReemplazado,
  onSeleccionar
}: {
  abierto: boolean
  onCerrar: () => void
  equipos: EquipoDeLaZonaDTO[]
  nombreReemplazado: string
  onSeleccionar: (equipo: EquipoDeLaZonaDTO) => void
}) {
  return (
    <Dialog open={abierto} onOpenChange={(o) => !o && onCerrar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Equipos de la zona</DialogTitle>
          <DialogDescription>
            Elegí qué equipo va a reemplazar a{' '}
            <strong>{nombreReemplazado}</strong>. Se modificará ÚNICAMENTE esta
            jornada de esta fecha, no se modificarán las otras fechas.
          </DialogDescription>
        </DialogHeader>
        <ul className='mt-2 space-y-1'>
          {equipos.map((e) => (
            <li key={e.id}>
              <button
                className='w-full text-left px-3 py-2 rounded-md hover:bg-muted text-sm transition-colors'
                onClick={() => {
                  onSeleccionar(e)
                  onCerrar()
                }}
              >
                {[e.codigo, e.nombre, e.club].filter(Boolean).join(' - ')}
              </button>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  )
}

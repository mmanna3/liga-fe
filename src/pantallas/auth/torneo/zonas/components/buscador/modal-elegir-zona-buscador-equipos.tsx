import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/design-system/base-ui/dialog'

export interface ZonaVisibleParaModal {
  indice: number
  nombre: string
}

interface ElegirZonaBuscadorEquiposProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  zonasVisibles: ZonaVisibleParaModal[]
  onElegirZona: (indiceZona: number) => void
}

export function ModalElegirZonaBuscadorEquipos({
  open,
  onOpenChange,
  zonasVisibles,
  onElegirZona
}: ElegirZonaBuscadorEquiposProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Elegir zona</DialogTitle>
        </DialogHeader>
        <ul className='max-h-64 space-y-1 overflow-y-auto py-1'>
          {zonasVisibles.map((z) => (
            <li key={z.indice}>
              <button
                type='button'
                className='w-full rounded-md border bg-background px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-accent'
                onClick={() => onElegirZona(z.indice)}
              >
                {z.nombre || `Zona ${z.indice + 1}`}
              </button>
            </li>
          ))}
        </ul>
        {zonasVisibles.length === 0 && (
          <p className='text-sm text-muted-foreground text-center py-6'>
            No hay zonas en pantalla
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}

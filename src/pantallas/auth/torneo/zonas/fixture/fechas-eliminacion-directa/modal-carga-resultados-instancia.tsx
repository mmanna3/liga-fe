import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/design-system/base-ui/dialog'
import { Boton } from '@/design-system/ykn-ui/boton'
import Icono from '@/design-system/ykn-ui/icono'

export function ModalCargaResultadosInstancia({
  open,
  onOpenChange,
  tituloInstancia,
  subtitulo
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Nombre de la instancia (ej. Cuartos de final). */
  tituloInstancia: string
  /** Texto secundario (ej. día de la fecha programada). */
  subtitulo?: string
}) {
  const descripcion = [tituloInstancia, subtitulo].filter(Boolean).join(' · ')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-1'>
            <Icono nombre='Pelota' className='size-6 shrink-0' />
            Cargar resultados
          </DialogTitle>
          <DialogDescription>{descripcion}</DialogDescription>
        </DialogHeader>
        <p className='text-sm text-muted-foreground py-1'>
          Acá se cargarán los resultados de los partidos de esta instancia.
        </p>
        <DialogFooter>
          <Boton
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Boton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

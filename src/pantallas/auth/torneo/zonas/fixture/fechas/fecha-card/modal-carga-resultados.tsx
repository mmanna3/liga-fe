import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/design-system/base-ui/dialog'

interface ModalCargaResultadosProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ModalCargaResultados({
  open,
  onOpenChange
}: ModalCargaResultadosProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='sr-only'>Jornada</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

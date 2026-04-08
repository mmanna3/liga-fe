import {
  Dialog,
  DialogContent,
  DialogTitle
} from '@/design-system/base-ui/dialog'

interface ModalDnisExpulsadosDeLaLigaProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ModalDnisExpulsadosDeLaLiga({
  open,
  onOpenChange
}: ModalDnisExpulsadosDeLaLigaProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogTitle className='sr-only'>
          DNIs expulsados de la liga
        </DialogTitle>
      </DialogContent>
    </Dialog>
  )
}

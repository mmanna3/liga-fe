import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/design-system/base-ui/alert-dialog'

interface ModalCambiosDetectadosEnEdicionProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRevertir: () => void
  onConfirmarYLimpiar: () => void
}

export default function ModalCambiosDetectadosEnEdicion({
  open,
  onOpenChange,
  onRevertir,
  onConfirmarYLimpiar
}: ModalCambiosDetectadosEnEdicionProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cambios detectados</AlertDialogTitle>
          <AlertDialogDescription>
            Realizaste cambios en este paso y por lo tanto todos los pasos
            siguientes se limpiarán.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onRevertir}>
            Revertir cambios
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirmarYLimpiar}>
            Confirmar cambios y limpiar pasos siguientes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

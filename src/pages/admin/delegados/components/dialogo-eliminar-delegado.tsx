import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'

interface DialogoEliminarDelegadoProps {
  descripcion: string
  delegadoId: number
  onConfirm: (id: number) => void
  trigger: React.ReactNode
  estaCargando?: boolean
}

export default function DialogoEliminarDelegado({
  descripcion,
  delegadoId,
  onConfirm,
  trigger,
  estaCargando = false
}: DialogoEliminarDelegadoProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Estás seguro de borrar definitivamente del sistema este delegado?
          </AlertDialogTitle>
          <AlertDialogDescription>{descripcion}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant='destructive'
            onClick={() => onConfirm(delegadoId)}
            disabled={estaCargando}
          >
            Eliminar definitivamente
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

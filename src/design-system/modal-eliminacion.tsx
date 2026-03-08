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
} from '@/design-system/base-ui/alert-dialog'
import { Button } from '@/design-system/base-ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/design-system/base-ui/card'

interface ModalEliminacionProps {
  titulo: string
  subtitulo: string
  contenido?: React.ReactNode
  eliminarOnClick: () => void
  eliminarTexto: string
  trigger?: React.ReactNode
  estaCargando?: boolean
  /** Cuando true, renderiza el contenido como página (Card) en lugar de modal */
  standalone?: boolean
  /** Para el modo standalone: acción al hacer clic en Cancelar */
  onCancelar?: () => void
}

export default function ModalEliminacion({
  titulo,
  subtitulo,
  contenido,
  eliminarOnClick,
  eliminarTexto,
  trigger,
  estaCargando = false,
  standalone = false,
  onCancelar
}: ModalEliminacionProps) {
  if (standalone) {
    return (
      <Card className='max-w-md mx-auto mt-10 p-4'>
        <CardHeader>
          <CardTitle>{titulo}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground text-sm mb-4'>{subtitulo}</p>
          {contenido}
          <div className='flex gap-2 justify-end mt-4'>
            {onCancelar && (
              <Button variant='outline' onClick={onCancelar}>
                Cancelar
              </Button>
            )}
            <Button
              variant='destructive'
              onClick={eliminarOnClick}
              disabled={estaCargando}
            >
              {estaCargando ? 'Eliminando...' : eliminarTexto}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{titulo}</AlertDialogTitle>
          <AlertDialogDescription>{subtitulo}</AlertDialogDescription>
          {contenido}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant='destructive'
            onClick={eliminarOnClick}
            disabled={estaCargando}
          >
            {estaCargando ? 'Eliminando...' : eliminarTexto}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

import ModalEliminacion from '@/design-system/modal-eliminacion'

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
    <ModalEliminacion
      titulo='¿Estás seguro de borrar definitivamente del sistema este delegado?'
      subtitulo={descripcion}
      eliminarOnClick={() => onConfirm(delegadoId)}
      eliminarTexto='Eliminar definitivamente'
      trigger={trigger}
      estaCargando={estaCargando}
    />
  )
}

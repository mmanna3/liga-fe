interface MensajeListaVaciaProps {
  mensaje: string
}

export default function MensajeListaVacia({ mensaje }: MensajeListaVaciaProps) {
  return (
    <p className='text-sm text-muted-foreground italic text-center py-4'>
      {mensaje}
    </p>
  )
}

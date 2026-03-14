interface CampoLecturaProps {
  titulo: string
  valor: React.ReactNode
}

export default function CampoLectura({ titulo, valor }: CampoLecturaProps) {
  return (
    <div className='space-y-2'>
      <p className='text-sm font-medium'>{titulo}</p>
      <div className='text-sm'>{valor}</div>
    </div>
  )
}

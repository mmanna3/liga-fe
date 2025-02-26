interface Props {
  clave: string
  valor: string
}

export default function DetalleItem({ clave, valor }: Props) {
  return (
    <div className='flex space-x-2'>
      <h2 className='text-md font-bold'>{clave}</h2>
      <p className='text-md'>{valor}</p>
    </div>
  )
}

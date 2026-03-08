interface Props {
  clave?: string
  valor: string
  icon?: React.ReactNode
}

export default function DetalleItem({ clave, valor, icon }: Props) {
  return (
    <div className='flex items-center gap-2'>
      {icon ? (
        <span className='text-gray-900 font-bold shrink-0 [&>svg]:stroke-[2.5]'>
          {icon}
        </span>
      ) : (
        <h2 className='text-md font-bold shrink-0'>{clave}:</h2>
      )}
      <p className='text-md'>{valor}</p>
    </div>
  )
}

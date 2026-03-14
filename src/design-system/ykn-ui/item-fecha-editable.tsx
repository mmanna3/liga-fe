import Icono from '@/design-system/ykn-ui/icono'
import InputFecha from '@/pantallas/auth/jugador/components/fecha-input-editable'
import { useState } from 'react'

interface ItemFechaEditableProps {
  valor: Date | undefined
  setValor: (value: Date | undefined) => void
}

export default function ItemFechaEditable({
  valor,
  setValor
}: ItemFechaEditableProps) {
  const [esEdicion, setEsEdicion] = useState(false)

  if (!esEdicion)
    return (
      <div className='flex group'>
        <p
          className='text-sm text-gray-500 group-hover:text-blue-700 group-hover:font-semibold'
          onClick={() => setEsEdicion(true)}
        >
          {valor ? valor.toLocaleDateString('es-AR') : 'Sin fecha'}
        </p>
        <Icono
          nombre='Editar'
          className='w-3 ml-1 pb-1 text-gray-500 hidden group-hover:block group-hover:text-blue-700 group-hover:font-semibold'
        />
      </div>
    )
  else
    return (
      <InputFecha
        fechaInicial={valor!}
        onChange={(date) => {
          setValor(date || undefined)
          setEsEdicion(false)
        }}
      />
    )
}

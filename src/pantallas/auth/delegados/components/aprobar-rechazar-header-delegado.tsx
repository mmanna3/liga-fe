import { AprobarDelegadoEnElClubDTO, DelegadoDTO } from '@/api/clients'
import { CardTitle } from '@/design-system/base-ui/card'
import { Skeleton } from '@/design-system/base-ui/skeleton'
import { TextoEditable } from '@/design-system/ykn-ui/texto-editable'
import ItemFechaEditable from '@/design-system/ykn-ui/item-fecha-editable'
import { useEffect, useState } from 'react'

interface IProps {
  delegado: DelegadoDTO | undefined
  delegadoClubId: number | undefined
  onChange: (dto: AprobarDelegadoEnElClubDTO) => void
}

export default function AprobarRechazarHeaderDelegado({
  delegado,
  delegadoClubId,
  onChange
}: IProps) {
  const [dni, setDni] = useState(delegado?.dni)
  const [nombre, setNombre] = useState(delegado?.nombre)
  const [apellido, setApellido] = useState(delegado?.apellido)
  const [fechaNacimiento, setFechaNacimiento] = useState(
    delegado?.fechaNacimiento
  )
  const [email, setEmail] = useState(delegado?.email ?? '')
  const [telefonoCelular, setTelefonoCelular] = useState(
    delegado?.telefonoCelular ?? ''
  )

  useEffect(() => {
    if (!delegado || !delegadoClubId) return
    onChange(
      new AprobarDelegadoEnElClubDTO({
        delegadoClubId,
        dni: dni ?? delegado.dni,
        nombre: nombre ?? delegado.nombre,
        apellido: apellido ?? delegado.apellido,
        fechaNacimiento: fechaNacimiento ?? delegado.fechaNacimiento,
        email: email || undefined,
        telefonoCelular: telefonoCelular || undefined
      })
    )
  }, [
    dni,
    nombre,
    apellido,
    fechaNacimiento,
    email,
    telefonoCelular,
    delegado,
    delegadoClubId
  ])

  if (!delegado)
    return (
      <div className='max-w-md mx-auto mt-10'>
        <Skeleton className='h-24 w-24' />
        <Skeleton className='h-6 w-64 my-3' />
        <Skeleton className='h-6 w-64 my-3' />
        <Skeleton className='h-6 w-64 my-3' />
      </div>
    )

  return (
    <>
      <img
        src={delegado.fotoCarnet}
        alt={`${delegado.nombre} ${delegado.apellido}`}
        className='w-32 h-32 rounded-lg object-cover'
      />
      <CardTitle className='mt-4 text-3xl font-semibold'>
        <div className='flex gap-2'>
          <TextoEditable
            valor={nombre ?? ''}
            alCambiar={(v) => setNombre(v)}
            tamanio='titulo'
          />
          <TextoEditable
            valor={apellido ?? ''}
            alCambiar={(v) => setApellido(v)}
            tamanio='titulo'
          />
        </div>
      </CardTitle>
      <TextoEditable
        valor={dni ?? ''}
        alCambiar={(v) => setDni(v)}
        tamanio='detalle'
      />
      <ItemFechaEditable
        valor={fechaNacimiento}
        setValor={setFechaNacimiento}
      />
      <TextoEditable
        valor={email}
        alCambiar={(v) => setEmail(v)}
        tamanio='detalle'
        etiqueta='Email'
        valorPorDefecto='-'
      />
      <TextoEditable
        valor={telefonoCelular}
        alCambiar={(v) => setTelefonoCelular(v)}
        tamanio='detalle'
        etiqueta='Teléfono'
        valorPorDefecto='-'
      />
    </>
  )
}

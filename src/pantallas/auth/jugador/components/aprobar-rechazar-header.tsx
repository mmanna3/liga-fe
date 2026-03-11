import { EquipoDelJugadorDTO, JugadorDTO } from '@/api/clients'
import { CardTitle } from '@/design-system/base-ui/card'
import { Skeleton } from '@/design-system/base-ui/skeleton'
import { TextoEditable } from '@/design-system/ykn-ui/texto-editable'
import Icono from '@/design-system/ykn-ui/icono'
import { useEffect, useState } from 'react'
import InputFecha from './fecha-input-editable'

interface IProps {
  jugador: JugadorDTO | undefined
  equipo: EquipoDelJugadorDTO | undefined
  onChange: (jugador: JugadorDTO) => void
}

export default function AprobarRechazarHeader({
  jugador,
  equipo,
  onChange
}: IProps) {
  const [dni, setDni] = useState(jugador?.dni)
  const [nombre, setNombre] = useState(jugador?.nombre)
  const [apellido, setApellido] = useState(jugador?.apellido)
  const [fechaNacimiento, setFechaNacimiento] = useState(
    jugador?.fechaNacimiento
  )

  useEffect(() => {
    if (!jugador) return
    onChange(
      new JugadorDTO({
        ...jugador,
        dni: dni!,
        nombre: nombre!,
        apellido: apellido!,
        fechaNacimiento: fechaNacimiento!
      })
    )
  }, [dni, nombre, apellido, fechaNacimiento, jugador])

  if (!jugador)
    return (
      <div className='max-w-md mx-auto mt-10'>
        <Skeleton className='h-24 w-24' />
        <Skeleton className='h-6 w-64 my-3' />
        <Skeleton className='h-6 w-64 my-3' />
        <Skeleton className='h-6 w-64 my-3' />
      </div>
    )
  else
    return (
      <>
        <img
          src={jugador!.fotoCarnet}
          alt={`${jugador!.nombre} ${jugador!.apellido}`}
        />
        <CardTitle className='mt-4 text-3xl font-semibold '>
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
        <p className='text-sm text-gray-500'>
          {equipo?.nombre} - {equipo?.club}
        </p>
      </>
    )
}

interface IItemFechaEditableProps {
  valor: Date | undefined
  setValor: (value: Date | undefined) => void
}

function ItemFechaEditable({ valor, setValor }: IItemFechaEditableProps) {
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

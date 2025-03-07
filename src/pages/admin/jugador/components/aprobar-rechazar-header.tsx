import { EquipoDelJugadorDTO, JugadorDTO } from '@/api/clients'
import { CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useEffect, useRef, useState } from 'react'

interface IProps {
  jugador: JugadorDTO | undefined
  equipo: EquipoDelJugadorDTO | undefined
}

export default function AprobarRechazarHeader({ jugador, equipo }: IProps) {
  const [dni, setDni] = useState(jugador?.dni)
  const [nombre, setNombre] = useState(jugador?.nombre)
  const [apellido, setApellido] = useState(jugador?.apellido)
  const [fechaNacimiento, setFechaNacimiento] = useState(
    jugador?.fechaNacimiento
  )

  useEffect(() => {
    console.log({ dni, nombre, apellido, fechaNacimiento })
  }, [dni, nombre, apellido, fechaNacimiento])

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
          <div className='flex gap-3'>
            <ItemTextoEditable
              valor={nombre}
              setValor={setNombre}
              tamanio='titulo'
            />
            <ItemTextoEditable
              valor={apellido}
              setValor={setApellido}
              tamanio='titulo'
            />
          </div>
        </CardTitle>
        <ItemTextoEditable valor={dni} setValor={setDni} tamanio='detalle' />
        <p className='text-sm text-gray-500'>
          {new Date(jugador!.fechaNacimiento!).toLocaleDateString('es-AR')}
        </p>
        <p className='text-sm text-gray-500'>
          {equipo?.nombre} - {equipo?.club}
        </p>
      </>
    )
}

interface IItemEditableProps {
  valor: string | undefined
  setValor: (value: string | undefined) => void
  tamanio: 'detalle' | 'titulo'
}

function ItemTextoEditable({ valor, setValor, tamanio }: IItemEditableProps) {
  const [esEdicion, setEsEdicion] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (esEdicion && inputRef.current) {
      inputRef.current.focus()
    }
  }, [esEdicion])

  const tamanioObj = {
    detalle: 'text-sm text-gray-500 ',
    titulo: 'text-3xl text-gray-900'
  }

  if (!esEdicion)
    return (
      <>
        <p
          className={`${tamanioObj[tamanio]}`}
          onClick={() => setEsEdicion(true)}
        >
          {valor}
        </p>
      </>
    )
  else
    return (
      <Input
        ref={(el) => {
          inputRef.current = el // Asigna el elemento a inputRef
          if (el) el.focus() // Asegura que se haga focus inmediatamente
        }}
        onBlur={() => setEsEdicion(false)}
        value={valor}
        onChange={(v) => setValor(v.target.value)}
      />
    )
}

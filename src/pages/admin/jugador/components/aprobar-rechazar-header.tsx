import { EquipoDelJugadorDTO, JugadorDTO } from '@/api/clients'
import { CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Pencil } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
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
    onChange(
      new JugadorDTO({
        dni: dni!,
        nombre: nombre!,
        apellido: apellido!,
        fechaNacimiento: fechaNacimiento!
      })
    )
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
          <div className='flex gap-2'>
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
    detalle: {
      p: 'text-sm text-gray-500',
      lapiz: 'w-3 ml-1 pb-1 text-gray-500'
    },
    titulo: {
      p: 'text-3xl text-gray-900',
      lapiz: 'w-5 ml-1 mt-2 text-gray-900'
    }
  }

  if (!esEdicion)
    return (
      <div className='flex group'>
        <p
          className={`${tamanioObj[tamanio].p}  group-hover:text-blue-700 group-hover:font-semibold`}
          onClick={() => setEsEdicion(true)}
        >
          {valor}
        </p>
        <Pencil
          className={`${tamanioObj[tamanio].lapiz} hidden group-hover:block group-hover:text-blue-700 group-hover:font-semibold`}
        />
      </div>
    )
  else
    return (
      <Input
        ref={(el) => {
          inputRef.current = el // Asigna el elemento a inputRef
          if (el) el.focus() // Asegura que se haga focus inmediatamente
        }}
        className='max-w-32 text-center'
        onBlur={() => setEsEdicion(false)}
        value={valor}
        onChange={(v) => setValor(v.target.value)}
      />
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
        <Pencil className='w-3 ml-1 pb-1 text-gray-500 hidden group-hover:block group-hover:text-blue-700 group-hover:font-semibold' />
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

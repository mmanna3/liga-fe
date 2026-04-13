import { api } from '@/api/api'
import { ClubDTO } from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import { Boton } from '@/design-system/ykn-ui/boton'
import ContenedorBotones from '@/design-system/ykn-ui/contenedor-botones'
import { Input } from '@/design-system/ykn-ui/input'
import LayoutSegundoNivel from '@/design-system/ykn-ui/layout-segundo-nivel'
import SelectorSimple from '@/design-system/ykn-ui/selector-simple'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CANCHA_TIPO_ID_POR_DEFECTO,
  OPCIONES_CANCHA_TIPO
} from './opciones-cancha-tipo'

export default function CrearClub() {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState<string>('')
  const [direccion, setDireccion] = useState<string>('')
  const [canchaTipoId, setCanchaTipoId] = useState<number>(
    CANCHA_TIPO_ID_POR_DEFECTO
  )
  const [localidad, setLocalidad] = useState<string>('')

  const mutation = useApiMutation({
    fn: async (nuevoClub: ClubDTO) => {
      await api.clubPOST(nuevoClub)
    },
    antesDeMensajeExito: () => navigate(rutasNavegacion.clubs),
    mensajeDeExito: `Club '${nombre}' creado correctamente`
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    mutation.mutate(
      new ClubDTO({
        nombre,
        direccion: direccion || undefined,
        canchaTipoId,
        localidad: localidad || undefined
      })
    )
  }

  return (
    <LayoutSegundoNivel
      titulo='Crear Club'
      contenido={
        <form onSubmit={handleSubmit} className='space-y-4'>
          <Input
            titulo='Nombre'
            id='nombre'
            type='text'
            placeholder='Nombre'
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <Input
            titulo='Dirección'
            id='direccion'
            type='text'
            placeholder='Dirección'
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
          />
          <Input
            titulo='Localidad'
            id='localidad'
            type='text'
            placeholder='Localidad'
            value={localidad}
            onChange={(e) => setLocalidad(e.target.value)}
          />
          <SelectorSimple
            titulo='Cancha'
            opciones={OPCIONES_CANCHA_TIPO}
            valorActual={String(canchaTipoId)}
            alElegirOpcion={(id) => setCanchaTipoId(Number(id))}
          />
          <ContenedorBotones>
            <Boton type='submit' estaCargando={mutation.isPending}>
              Guardar
            </Boton>
          </ContenedorBotones>
        </form>
      }
      maxWidth='md'
    />
  )
}

import { api } from '@/api/api'
import { ClubDTO } from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import { Input } from '@/design-system/ykn-ui/input'
import { Label } from '@/design-system/base-ui/label'
import { Switch } from '@/design-system/base-ui/switch'
import { Boton } from '@/design-system/ykn-ui/boton'
import ContenedorBotones from '@/design-system/ykn-ui/contenedor-botones'
import LayoutSegundoNivel from '@/design-system/ykn-ui/layout-segundo-nivel'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CrearClub() {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState<string>('')
  const [direccion, setDireccion] = useState<string>('')
  const [esTechado, setEsTechado] = useState<boolean>(false)
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
        esTechado,
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
          <div className='flex items-center justify-between space-x-2'>
            <Label htmlFor='esTechado'>¿Es techado?</Label>
            <Switch
              id='esTechado'
              checked={esTechado}
              onCheckedChange={setEsTechado}
              textoApagado='No'
              textoPrendido='Sí'
            />
          </div>
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

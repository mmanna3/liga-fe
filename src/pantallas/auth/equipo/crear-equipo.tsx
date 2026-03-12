import { api } from '@/api/api'
import { EquipoDTO } from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import { Boton } from '@/design-system/ykn-ui/boton'
import { Input } from '@/design-system/base-ui/input'
import { Label } from '@/design-system/base-ui/label'
import LayoutSegundoNivel from '@/design-system/ykn-ui/layout-segundo-nivel'
import ContenedorBotones from '@/design-system/ykn-ui/contenedor-botones'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function CrearEquipo() {
  const navigate = useNavigate()
  const { clubid } = useParams<{ clubid: string }>()
  const [nombre, setNombre] = useState<string>('')

  const mutation = useApiMutation({
    fn: async (nuevoEquipo: EquipoDTO) => {
      await api.equipoPOST(nuevoEquipo)
    },
    antesDeMensajeExito: () =>
      navigate(`${rutasNavegacion.detalleClub}/${clubid}`),
    mensajeDeExito: `Equipo '${nombre}' creado correctamente`
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    mutation.mutate(
      new EquipoDTO({
        nombre,
        clubId: Number(clubid)
      })
    )
  }

  return (
    <LayoutSegundoNivel
      titulo='Crear Equipo'
      contenido={
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='nombre'>Nombre</Label>
            <Input
              id='nombre'
              type='text'
              placeholder='Nombre'
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
          <p className='text-sm text-muted-foreground'>
            El equipo se crea sin torneo. Asignalo a una zona desde el torneo
            correspondiente.
          </p>
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

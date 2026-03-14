import { api } from '@/api/api'
import { EquipoDTO } from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import useApiQuery from '@/api/hooks/use-api-query'
import { ContenedorCargandoYError } from '@/design-system/cargando-y-error-contenedor'
import { Boton } from '@/design-system/ykn-ui/boton'
import ContenedorBotones from '@/design-system/ykn-ui/contenedor-botones'
import { Input } from '@/design-system/ykn-ui/input'
import LayoutSegundoNivel from '@/design-system/ykn-ui/layout-segundo-nivel'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function EditarEquipo() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [nombre, setNombre] = useState<string>('')
  const [clubId, setClubId] = useState<number | null>(null)

  const {
    data: equipo,
    isLoading: isLoadingEquipo,
    isError: isErrorEquipo
  } = useApiQuery<EquipoDTO>({
    key: ['equipo', id],
    fn: async () => await api.equipoGET(Number(id))
  })

  useEffect(() => {
    if (equipo) {
      setNombre(equipo.nombre || '')
      setClubId(equipo.clubId ?? null)
    }
  }, [equipo])

  const mutation = useApiMutation({
    fn: async (equipoActualizado: EquipoDTO) => {
      await api.equipoPUT(Number(id), equipoActualizado)
    },
    antesDeMensajeExito: () => {
      navigate(`${rutasNavegacion.equipos}`)
    },
    mensajeDeExito: `Equipo '${nombre}' actualizado correctamente`
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (clubId == null) return
    mutation.mutate(
      new EquipoDTO({
        id: Number(id),
        nombre,
        clubId,
        zonas: equipo?.zonas ?? []
      })
    )
  }

  const isLoading = isLoadingEquipo || mutation.isPending

  return (
    <ContenedorCargandoYError estaCargando={isLoading} hayError={isErrorEquipo}>
      <LayoutSegundoNivel
        titulo='Editar Equipo'
        pathBotonVolver={rutasNavegacion.equipos}
        maxWidth='md'
        contenido={
          <form onSubmit={handleSubmit} className='space-y-4'>
            <Input
              titulo='Nombre del equipo'
              id='nombre'
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder='Nombre del equipo'
              required
            />
            <p className='text-sm text-muted-foreground'>
              Las zonas del equipo se gestionan desde el torneo correspondiente.
            </p>
            <ContenedorBotones>
              <Boton type='submit'>Guardar</Boton>
            </ContenedorBotones>
          </form>
        }
      />
    </ContenedorCargandoYError>
  )
}

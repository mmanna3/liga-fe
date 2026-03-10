import { api } from '@/api/api'
import { TorneoAgrupadorDTO, TorneoDTO } from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import useApiQuery from '@/api/hooks/use-api-query'
import { ContenedorCargandoYError } from '@/design-system/cargando-y-error-contenedor'
import { Boton } from '@/design-system/ykn-ui/boton'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/design-system/base-ui/card'
import { Input } from '@/design-system/base-ui/input'
import { Label } from '@/design-system/base-ui/label'
import { Switch } from '@/design-system/base-ui/switch'
import BotonVolver from '@/design-system/ykn-ui/boton-volver'
import ContenedorBotones from '@/design-system/ykn-ui/contenedor-botones'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

/** TorneoAgrupadorDTO con torneos (viene del GET por id) */
type TorneoAgrupadorConTorneos = TorneoAgrupadorDTO & {
  torneos?: TorneoDTO[]
}

export default function EditarAgrupadorTorneo() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [visibleEnApp, setVisibleEnApp] = useState(false)

  const {
    data: agrupador,
    isError,
    isLoading
  } = useApiQuery({
    key: ['torneoAgrupador', id],
    fn: async () => {
      const res = await api.torneoAgrupadorGET(Number(id))
      return res as TorneoAgrupadorConTorneos
    }
  })

  const mutation = useApiMutation({
    fn: async (dto: TorneoAgrupadorDTO) => {
      await api.torneoAgrupadorPUT(Number(id), dto)
    },
    mensajeDeExito: 'Agrupador actualizado correctamente'
  })

  useEffect(() => {
    if (agrupador) {
      setNombre(agrupador.nombre || '')
      setVisibleEnApp(agrupador.visibleEnApp ?? false)
    }
  }, [agrupador])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!agrupador) return
    if (
      nombre === agrupador.nombre &&
      visibleEnApp === (agrupador.visibleEnApp ?? false)
    )
      return

    await mutation.mutateAsync(
      new TorneoAgrupadorDTO({
        id: agrupador.id,
        nombre,
        visibleEnApp
      })
    )
    navigate(rutasNavegacion.agrupadoresTorneo)
  }

  const torneos = (agrupador as TorneoAgrupadorConTorneos)?.torneos ?? []

  return (
    <ContenedorCargandoYError
      estaCargando={isLoading}
      hayError={isError}
      mensajeDeError='No se pudieron recuperar los datos del agrupador'
    >
      <div className='mb-4'>
        <BotonVolver path={rutasNavegacion.agrupadoresTorneo} />
      </div>
      <Card className='max-w-md mx-auto p-4'>
        <CardHeader>
          <CardTitle>Editar agrupador</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='space-y-2'>
              <Label htmlFor='nombre'>Nombre</Label>
              <Input
                id='nombre'
                type='text'
                placeholder='Nombre del agrupador'
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div className='flex items-center justify-between space-x-2'>
              <Label htmlFor='visibleEnApp'>Visible en la app</Label>
              <Switch
                id='visibleEnApp'
                checked={visibleEnApp}
                onCheckedChange={setVisibleEnApp}
              />
            </div>

            <div className='space-y-2'>
              <Label>Torneos</Label>
              {torneos.length > 0 ? (
                <ul className='space-y-2 divide-y divide-gray-100'>
                  {torneos.map((torneo) => (
                    <li key={torneo.id} className='pt-2 first:pt-0'>
                      <Boton
                        variant='ghost'
                        className='w-full justify-start font-normal hover:bg-gray-50'
                        onClick={() =>
                          navigate(
                            `${rutasNavegacion.detalleTorneo}/${torneo.id}`
                          )
                        }
                      >
                        {torneo.nombre}
                      </Boton>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='text-gray-500 text-sm italic py-4'>
                  No hay torneos en este agrupador
                </p>
              )}
            </div>

            <ContenedorBotones>
              <Boton
                type='submit'
                estaCargando={mutation.isPending}
                disabled={
                  nombre === agrupador?.nombre &&
                  visibleEnApp === (agrupador?.visibleEnApp ?? false)
                }
              >
                Guardar
              </Boton>
            </ContenedorBotones>
          </form>
        </CardContent>
      </Card>
    </ContenedorCargandoYError>
  )
}

import { api } from '@/api/api'
import { TorneoAgrupadorDTO, TorneoDTO } from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import useApiQuery from '@/api/hooks/use-api-query'
import { ContenedorCargandoYError } from '@/design-system/cargando-y-error-contenedor'
import { Boton } from '@/design-system/ykn-ui/boton'
import { Label } from '@/design-system/base-ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/design-system/base-ui/select'
import { Switch } from '@/design-system/base-ui/switch'
import CampoLectura from '@/design-system/ykn-ui/campo-lectura'
import ContenedorBotones from '@/design-system/ykn-ui/contenedor-botones'
import { Input } from '@/design-system/ykn-ui/input'
import LayoutSegundoNivel from '@/design-system/ykn-ui/layout-segundo-nivel'
import MensajeListaVacia from '@/design-system/ykn-ui/mensaje-lista-vacia'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useEffect, useState } from 'react'
import {
  COLORES_AGRUPADOR_TORNEO,
  colorAgrupadorValidoODefecto
} from './colores-agrupador-torneo'
import { useNavigate, useParams } from 'react-router-dom'

/** TorneoAgrupadorDTO con torneos (viene del GET por id) */
type TorneoAgrupadorConTorneos = TorneoAgrupadorDTO & {
  torneos?: TorneoDTO[]
}

export default function EditarAgrupadorTorneo() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [color, setColor] = useState<string>(COLORES_AGRUPADOR_TORNEO[0])
  const [esVisibleEnApp, setVisibleEnApp] = useState(false)

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
      setVisibleEnApp(agrupador.esVisibleEnApp ?? false)
      setColor(colorAgrupadorValidoODefecto(agrupador.color))
    }
  }, [agrupador])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!agrupador) return
    const colorInicial = colorAgrupadorValidoODefecto(agrupador.color)

    if (
      nombre === agrupador.nombre &&
      esVisibleEnApp === (agrupador.esVisibleEnApp ?? false) &&
      color === colorInicial
    )
      return

    await mutation.mutateAsync(
      new TorneoAgrupadorDTO({
        id: agrupador.id,
        nombre,
        color,
        esVisibleEnApp
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
      <LayoutSegundoNivel
        titulo='Editar agrupador'
        pathBotonVolver={rutasNavegacion.agrupadoresTorneo}
        maxWidth='md'
        contenido={
          <form onSubmit={handleSubmit} className='space-y-6'>
            <Input
              titulo='Nombre'
              id='nombre'
              type='text'
              placeholder='Nombre del agrupador'
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />

            <div className='flex items-center justify-between space-x-2'>
              <Label htmlFor='esVisibleEnApp'>Visible en la app</Label>
              <Switch
                id='esVisibleEnApp'
                checked={esVisibleEnApp}
                onCheckedChange={setVisibleEnApp}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='color-agrupador'>Color</Label>
              <Select value={color} onValueChange={setColor}>
                <SelectTrigger id='color-agrupador'>
                  <SelectValue placeholder='Elegir color' />
                </SelectTrigger>
                <SelectContent>
                  {COLORES_AGRUPADOR_TORNEO.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <CampoLectura
              titulo='Torneos'
              valor={
                torneos.length > 0 ? (
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
                  <MensajeListaVacia mensaje='No hay torneos en este agrupador' />
                )
              }
            />

            <ContenedorBotones>
              <Boton
                type='submit'
                estaCargando={mutation.isPending}
                disabled={
                  !agrupador ||
                  (nombre === agrupador.nombre &&
                    esVisibleEnApp === (agrupador.esVisibleEnApp ?? false) &&
                    color === colorAgrupadorValidoODefecto(agrupador.color))
                }
              >
                Guardar
              </Boton>
            </ContenedorBotones>
          </form>
        }
      />
    </ContenedorCargandoYError>
  )
}

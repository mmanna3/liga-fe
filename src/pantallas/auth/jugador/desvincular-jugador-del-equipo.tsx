import { api } from '@/api/api'
import { DesvincularJugadorDelEquipoDTO } from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import { Boton } from '@/design-system/ykn-ui/boton'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/design-system/base-ui/card'
import BotonVolver from '@/design-system/ykn-ui/boton-volver'
import ContenedorBotones from '@/design-system/ykn-ui/contenedor-botones'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useNavigate, useParams } from 'react-router-dom'

export default function DesvincularJugadorDelEquipo() {
  const { id, dni, equipoId, equipoNombre } = useParams<{
    id: string
    dni: string
    equipoId: string
    equipoNombre: string
  }>()
  const navigate = useNavigate()
  const mutation = useApiMutation({
    fn: async (dto: DesvincularJugadorDelEquipoDTO) => {
      await api.desvincularJugadorDelEquipo(dto)
    },
    antesDeMensajeExito: () => navigate(rutasNavegacion.jugadores),
    mensajeDeExito: `El jugador de DNI '${dni}' fue desvinculado del equipo '${equipoNombre}'.`
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    mutation.mutate(
      new DesvincularJugadorDelEquipoDTO({
        jugadorId: Number(id),
        equipoId: Number(equipoId)
      })
    )
  }

  return (
    <>
      <div className='mb-4'>
        <BotonVolver path={rutasNavegacion.jugadores} />
      </div>
      <Card className='max-w-md mx-auto p-4'>
        <CardHeader>
          <CardTitle>Desvincular jugador</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <p>
              ¿Desvincular al jugador de DNI: {dni} del equipo{' '}
              <strong>{equipoNombre}</strong>?
            </p>
            <p>Si es su único equipo, se lo eliminará del sistema.</p>
            <div className='mt-16'>
              <ContenedorBotones>
                <Boton type='submit' estaCargando={mutation.isPending}>
                  Desvincular jugador del equipo
                </Boton>
              </ContenedorBotones>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  )
}

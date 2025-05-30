import { api } from '@/api/api'
import { DesvincularJugadorDelEquipoDTO } from '@/api/clients'
import useApiMutation from '@/api/custom-hooks/use-api-mutation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import BotonVolver from '@/components/ykn-ui/boton-volver'
import Botonera from '@/components/ykn-ui/botonera'
import { rutasNavegacion } from '@/routes/rutas'
import { useNavigate, useParams } from 'react-router-dom'

export default function DesvincularJugadorDelEquipo() {
  const { id, dni, equipoId, equipoNombre } = useParams<{ id: string; dni: string; equipoId: string; equipoNombre: string }>()
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
    mutation.mutate(new DesvincularJugadorDelEquipoDTO({jugadorId: Number(id), equipoId: Number(equipoId)}))
  }

  return (
    <Card className='max-w-md mx-auto mt-10 p-4'>
      <CardHeader>
        <CardTitle>Desvincular jugador</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <p>
            ¿Desvincular al jugador de DNI: {dni} del equipo <strong>{equipoNombre}</strong>? 
          </p>
          <p>
          Si es su único equipo, se lo eliminará del sistema.
          </p>
          <div className='mt-16'>
          <Botonera>
            <BotonVolver texto='Cancelar' />
            <Button type='submit' disabled={mutation.isPending}>
              {mutation.isPending ? 'Desvinculando...' : 'Desvincular jugador del equipo'}
            </Button>
          </Botonera>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

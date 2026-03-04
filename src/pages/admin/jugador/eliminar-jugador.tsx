import { api } from '@/api/api'
import useApiMutation from '@/api/custom-hooks/use-api-mutation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import BotonVolver from '@/components/ykn-ui/boton-volver'
import Botonera from '@/components/ykn-ui/botonera'
import { rutasNavegacion } from '@/routes/rutas'
import { useNavigate, useParams } from 'react-router-dom'

export default function EliminarJugador() {
  const { id, dni } = useParams<{ id: string; dni: string }>()
  const navigate = useNavigate()
  const mutation = useApiMutation({
    fn: async (id: number) => {
      await api.jugadorDELETE(id)
    },
    antesDeMensajeExito: () => navigate(rutasNavegacion.jugadores),
    mensajeDeExito: `El jugador de DNI '${dni}' fue eliminado.`
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    mutation.mutate(Number(id))
  }

  return (
    <>
      <div className='mb-4'>
        <BotonVolver path={rutasNavegacion.jugadores} />
      </div>
      <Card className='max-w-md mx-auto p-4'>
        <CardHeader>
          <CardTitle>Eliminar jugador</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <p>
              Al eliminar el jugador, se lo desvinculará también de todos los
              equipos.
            </p>
            <Botonera>
              <Button type='submit' disabled={mutation.isPending}>
                {mutation.isPending ? 'Eliminando...' : 'Eliminar jugador'}
              </Button>
            </Botonera>
          </form>
        </CardContent>
      </Card>
    </>
  )
}

import { api } from '@/api/api'
import useApiMutation from '@/api/custom-hooks/use-api-mutation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import BotonVolver from '@/components/ykn-ui/boton-volver'
import Botonera from '@/components/ykn-ui/botonera'
import { rutasNavegacion } from '@/routes/rutas'
import { useNavigate, useParams } from 'react-router-dom'

export default function EliminarDelegado() {
  const { id, usuario } = useParams<{ id: string; usuario: string }>()
  const navigate = useNavigate()
  const mutation = useApiMutation({
    fn: async (id: number) => {
      await api.delegadoDELETE(id)
    },
    antesDeMensajeExito: () => navigate(rutasNavegacion.delegados),
    mensajeDeExito: `El delegado '${usuario}' fue eliminado.`
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    mutation.mutate(Number(id))
  }

  return (
    <Card className='max-w-md mx-auto mt-10 p-4'>
      <CardHeader>
        <CardTitle>Eliminar delegado</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <p>
            Al eliminar el delegado, se lo desvinculará del club al que
            pertenezca.
          </p>
          <Botonera>
            <BotonVolver texto='Cancelar' />
            <Button type='submit' disabled={mutation.isPending}>
              {mutation.isPending ? 'Eliminando...' : 'Eliminar delegado'}
            </Button>
          </Botonera>
        </form>
      </CardContent>
    </Card>
  )
}

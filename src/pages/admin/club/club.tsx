import { api } from '@/api/api'
import useApiQuery from '@/api/custom-hooks/use-api-query'
import { Button } from '@/components/ui/button'
import Botonera from '@/components/ykn-ui/botonera'
import Titulo from '@/components/ykn-ui/titulo'
import { rutasNavegacion } from '@/routes/rutas'
import { useNavigate } from 'react-router-dom'
import Tabla from './tabla'

export default function Club() {
  const { data, isLoading, isError } = useApiQuery({
    key: ['clubs'],
    fn: async () => await api.clubAll()
  })

  const navigate = useNavigate()

  return (
    <>
      <Titulo>Clubs</Titulo>
      <Botonera>
        <Button onClick={() => navigate(rutasNavegacion.crearClub)}>
          Crear nuevo club
        </Button>
      </Botonera>
      <Tabla data={data || []} isLoading={isLoading} isError={isError} />
    </>
  )
}

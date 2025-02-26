import { api } from '@/api/api'
import useApiQuery from '@/api/custom-hooks/use-api-query'
import Botonera from '@/components/ui/botonera'
import { Button } from '@/components/ui/button'
import Titulo from '@/components/ui/titulo'
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
        <Button onClick={() => navigate('/admin/clubs/crear')}>
          Crear nuevo club
        </Button>
      </Botonera>
      <Tabla data={data!} isLoading={isLoading} isError={isError} />
    </>
  )
}

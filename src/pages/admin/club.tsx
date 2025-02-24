import Botonera from '@/components/ui/botonera'
import { Button } from '@/components/ui/button'
import Titulo from '@/components/ui/titulo'
import { BASE_URL } from '@/consts'
import { useQuery } from '@tanstack/react-query'
import Tabla from './tabla'

const fetchClubs = async () => {
  const response = await fetch(`${BASE_URL}/club`)
  if (!response.ok) {
    throw new Error('Error al obtener los datos')
  }
  return response.json()
}

export default function Club() {
  const { data, isLoading } = useQuery({
    queryKey: ['clubs'],
    queryFn: fetchClubs
  })

  return (
    <>
      <Titulo>Clubs</Titulo>
      <Botonera>
        <Button>Crear nuevo club</Button>
      </Botonera>
      <Tabla data={data} isLoading={isLoading} />
    </>
  )
}

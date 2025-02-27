import { api } from '@/api/api'
import useApiQuery from '@/api/custom-hooks/use-api-query'
import Titulo from '@/components/ykn-ui/titulo'
import Tabla from './tabla'

export default function Jugador() {
  const { data, isLoading, isError } = useApiQuery({
    key: ['jugadores'],
    fn: async () => await api.jugadorAll()
  })

  return (
    <>
      <Titulo>Jugadores</Titulo>
      <div className='mb-10' />
      <Tabla data={data!} isLoading={isLoading} isError={isError} />
    </>
  )
}

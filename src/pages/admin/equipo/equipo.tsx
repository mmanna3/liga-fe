import { api } from '@/api/api'
import useApiQuery from '@/api/custom-hooks/use-api-query'
import Titulo from '@/components/ykn-ui/titulo'
import Tabla from './tabla'

export default function EquipoHome() {
  const { data, isLoading, isError } = useApiQuery({
    key: ['equipos'],
    fn: async () => await api.equipoAll()
  })

  return (
    <>
      <Titulo>Equipos</Titulo>
      <div className='mb-10' />
      <Tabla data={data || []} isLoading={isLoading} isError={isError} />
    </>
  )
}

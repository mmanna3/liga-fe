import { api } from '@/api/api'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/design-system/base-ui/card'
import BotonVolver from '@/design-system/ykn-ui/boton-volver'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

export default function DetalleTorneo() {
  const { id } = useParams<{ id: string }>()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['torneo', id],
    queryFn: async () => {
      const response = await api.torneoGET(Number(id))
      return response
    }
  })

  if (isLoading) return <div>Cargando...</div>
  if (isError) return <div>Error al cargar el torneo</div>
  if (!data) return <div>No se encontró el torneo</div>

  return (
    <>
      <div className='mb-4'>
        <BotonVolver />
      </div>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>Detalle del Torneo: {data.nombre}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div>
              <p className='text-muted-foreground'>
                Año: {data.anio}
                {data.torneoAgrupadorNombre && (
                  <> · Agrupador: {data.torneoAgrupadorNombre}</>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

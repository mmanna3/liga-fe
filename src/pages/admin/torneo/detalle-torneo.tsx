import { api } from '@/api/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import BotonVolver from '@/components/ykn-ui/boton-volver'
import Botonera from '@/components/ykn-ui/botonera'
import { rutasNavegacion } from '@/routes/rutas'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'

export default function DetalleTorneo() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

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
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle>Detalle del Torneo: {data.nombre}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div>
            <h3 className='text-lg font-semibold'>Equipos</h3>
            {data.equipos && data.equipos.length > 0 ? (
              <ul className='list-disc pl-5 mt-2'>
                {data.equipos.map((equipo) => (
                  <li key={equipo.id}>
                    <span
                      className='cursor-pointer text-blue-500 hover:underline'
                      onClick={() =>
                        navigate(
                          `${rutasNavegacion.detalleEquipo}/${equipo.id}`
                        )
                      }
                    >
                      {equipo.nombre}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className='text-gray-500 mt-2'>
                No hay equipos en este torneo
              </p>
            )}
          </div>

          <Botonera>
            <BotonVolver texto='Volver' />
          </Botonera>
        </div>
      </CardContent>
    </Card>
  )
}

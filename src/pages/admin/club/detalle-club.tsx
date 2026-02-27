import { api } from '@/api/api'
import useApiQuery from '@/api/custom-hooks/use-api-query'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { VisibleSoloParaAdmin } from '@/components/visible-solo-para-admin'
import BotonVolver from '@/components/ykn-ui/boton-volver'
import { rutasNavegacion } from '@/routes/rutas'
import { PlusCircle, Shield, UserCog } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

export default function DetalleClub() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const {
    data: club,
    isError,
    isLoading
  } = useApiQuery({
    key: ['club', id],
    fn: async () => await api.clubGET(Number(id))
  })

  if (isError) {
    return (
      <Alert variant='destructive' className='mb-4'>
        <AlertTitle className='text-xl font-semibold'>Error</AlertTitle>
        <AlertDescription>
          No se pudieron recuperar los datos del club.
        </AlertDescription>
      </Alert>
    )
  }

  if (isLoading) {
    return (
      <div className='max-w-3xl mx-auto mt-10 px-4'>
        <Skeleton className='h-16 w-full mb-6' />
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <Skeleton className='h-64 w-full' />
          <Skeleton className='h-64 w-full' />
        </div>
      </div>
    )
  }

  return (
    <div className='max-w-3xl mx-auto mt-10 px-4'>
      <Card className='mb-6 shadow-md'>
        <CardHeader className='pb-4'>
          <CardTitle className='text-3xl font-bold text-primary'>
            {club!.nombre}
          </CardTitle>
        </CardHeader>
      </Card>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Card className='shadow-md'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-xl font-semibold flex items-center gap-2'>
              <UserCog className='h-5 w-5' />
              Delegados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {club!.delegados && club!.delegados.length > 0 ? (
              <ul className='space-y-2 divide-y divide-gray-100'>
                {club!.delegados.map((delegado) => (
                  <li key={delegado.id} className='pt-2 first:pt-0'>
                    <Button
                      variant='ghost'
                      className='w-full justify-start font-normal hover:bg-gray-50'
                      onClick={() =>
                        navigate(
                          `${rutasNavegacion.detalleDelegado}/${delegado.id}`
                        )
                      }
                    >
                      {delegado.nombre} {delegado.apellido}
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className='text-gray-500 text-sm italic text-center py-4'>
                No hay delegados registrados
              </p>
            )}
          </CardContent>
        </Card>

        <Card className='shadow-md'>
          <CardHeader className='pb-3 flex flex-row items-center justify-between'>
            <CardTitle className='text-xl font-semibold flex items-center gap-2'>
              <Shield className='h-5 w-5' />
              Equipos
            </CardTitle>
            <VisibleSoloParaAdmin>
              <Button
                onClick={() => navigate(`${rutasNavegacion.crearEquipo}/${id}`)}
                variant='outline'
                size='sm'
                className='flex items-center gap-1'
              >
                <PlusCircle className='h-4 w-4' />
                Nuevo
              </Button>
            </VisibleSoloParaAdmin>
          </CardHeader>
          <CardContent>
            {club!.equipos && club!.equipos.length > 0 ? (
              <ul className='space-y-3'>
                {club!.equipos.map((equipo) => (
                  <li
                    key={equipo.id}
                    className='flex items-center justify-between bg-gray-50 rounded-lg p-3'
                  >
                    <Button
                      variant='ghost'
                      className='p-0 h-auto text-left font-normal hover:bg-transparent'
                      onClick={() =>
                        navigate(
                          `${rutasNavegacion.detalleEquipo}/${equipo.id}`
                        )
                      }
                    >
                      {equipo.nombre}
                    </Button>
                    {equipo.torneoNombre ? (
                      <span className='text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded-full'>
                        {equipo.torneoNombre}
                      </span>
                    ) : (
                      <span className='text-sm px-3 py-1 bg-gray-100 text-gray-600 rounded-full'>
                        Sin torneo
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className='text-gray-500 text-sm italic text-center py-4'>
                No hay equipos registrados
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className='mt-6'>
        <BotonVolver path={rutasNavegacion.clubs} />
      </div>
    </div>
  )
}

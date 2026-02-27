import { api } from '@/api/api'
import useApiMutation from '@/api/custom-hooks/use-api-mutation'
import useApiQuery from '@/api/custom-hooks/use-api-query'
import { ContenedorCargandoYError } from '@/components/cargando-y-error-contenedor'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { VisibleSoloParaAdmin } from '@/components/visible-solo-para-admin'
import BotonVolver from '@/components/ykn-ui/boton-volver'
import DetalleItem from '@/components/ykn-ui/detalle-item'
import DialogoEliminarDelegado from './components/dialogo-eliminar-delegado'
import { EstadoDelegado } from '@/lib/utils'
import { estadoBadgeClassDelegado } from '@/lib/utils'
import { rutasNavegacion } from '@/routes/rutas'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

export default function DetalleDelegado() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams<{ id: string }>()
  const volverADelegados = () =>
    navigate(`${rutasNavegacion.delegados}${location.search}`)

  const {
    data: delegado,
    isError,
    isLoading
  } = useApiQuery({
    key: ['delegado', id],
    fn: async () => await api.delegadoGET(Number(id))
  })

  const eliminarMutation = useApiMutation({
    fn: async (delegadoId: number) => {
      await api.delegadoDELETE(delegadoId)
    },
    antesDeMensajeExito: volverADelegados,
    mensajeDeExito: 'Delegado eliminado del sistema'
  })

  return (
    <ContenedorCargandoYError
      estaCargando={isLoading}
      hayError={isError}
      mensajeDeError='No se pudieron recuperar los datos del delegado'
    >
      {delegado && (
        <Card className='max-w-lg mx-auto mt-10 p-6 rounded-xl border bg-white'>
          <CardHeader className='flex flex-col items-center text-center'>
            <img
              src={delegado.fotoCarnet}
              alt={`${delegado.nombre} ${delegado.apellido}`}
              className='w-32 h-32 rounded-lg object-cover'
            />
            <CardTitle className='mt-4 text-3xl font-semibold text-gray-900'>
              {delegado.nombre} {delegado.apellido}
            </CardTitle>
            <div className='mt-3 flex flex-wrap gap-2 justify-center'>
              {delegado.estadoDelegado && (
                <Badge
                  className={`px-3 py-1 rounded-md ${estadoBadgeClassDelegado[delegado.estadoDelegado.id!] ?? ''}`}
                >
                  {delegado.estadoDelegado.estado}
                </Badge>
              )}
              {delegado.blanqueoPendiente && (
                <Badge className='px-3 py-1 rounded-md bg-blue-700'>
                  Blanqueo pendiente
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <div className='flex flex-col gap-1 bg-gray-50 p-5 rounded-lg mb-6'>
              <DetalleItem clave='DNI' valor={delegado.dni} />
              <DetalleItem
                clave='Usuario'
                valor={delegado.nombreUsuario ?? 'Usuario aún no generado'}
              />
              <DetalleItem
                clave='Fecha de nacimiento'
                valor={delegado.fechaNacimiento.toLocaleDateString('es-AR')}
              />
              {delegado.email && (
                <DetalleItem clave='Email' valor={delegado.email} />
              )}
              {delegado.telefonoCelular && (
                <DetalleItem
                  clave='Teléfono'
                  valor={delegado.telefonoCelular}
                />
              )}
            </div>

            <h2 className='text-lg font-medium mt-6 mb-3 text-gray-700'>
              Club
            </h2>
            <div className='bg-gray-50 p-5 rounded-lg mb-4'>
              <p className='text-base font-semibold text-gray-900 mb-2'>
                {delegado.clubNombre}
              </p>
              {delegado.equiposDelClub &&
                delegado.equiposDelClub.length > 0 && (
                  <ul className='divide-y divide-gray-200'>
                    {delegado.equiposDelClub.map((nombre) => (
                      <li key={nombre} className='py-2 text-sm text-gray-700'>
                        {nombre}
                      </li>
                    ))}
                  </ul>
                )}
            </div>

            {delegado.estadoDelegado?.id ===
              EstadoDelegado.PendienteDeAprobacion && (
              <VisibleSoloParaAdmin>
                <div className='flex justify-end mt-2'>
                  <Button
                    variant='ghost'
                    className='text-blue-600'
                    onClick={() =>
                      navigate(
                        `${rutasNavegacion.aprobarRechazarDelegado}/${delegado.id}${location.search}`
                      )
                    }
                  >
                    Gestionar
                  </Button>
                </div>
              </VisibleSoloParaAdmin>
            )}
          </CardContent>

          <div className='flex gap-2 justify-end mt-6'>
            <VisibleSoloParaAdmin>
              <DialogoEliminarDelegado
                descripcion='Si confirmás la eliminación, toda su información se perderá y tendrá que volver a ficharse.'
                delegadoId={delegado.id!}
                onConfirm={(delegadoId) => eliminarMutation.mutate(delegadoId)}
                estaCargando={eliminarMutation.isPending}
                trigger={
                  <Button variant='destructive'>Eliminar delegado</Button>
                }
              />
            </VisibleSoloParaAdmin>
            <BotonVolver texto='Volver' />
          </div>
        </Card>
      )}
    </ContenedorCargandoYError>
  )
}

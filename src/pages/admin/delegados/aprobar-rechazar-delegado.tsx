import { api } from '@/api/api'
import { AprobarDelegadoEnElClubDTO } from '@/api/clients'
import useApiMutation from '@/api/custom-hooks/use-api-mutation'
import useApiQuery from '@/api/custom-hooks/use-api-query'
import { ContenedorCargandoYError } from '@/components/cargando-y-error-contenedor'
import DialogoEliminarDelegado from './components/dialogo-eliminar-delegado'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Boton } from '@/components/ykn-ui/boton'
import BotonVolver from '@/components/ykn-ui/boton-volver'
import DetalleItem from '@/components/ykn-ui/detalle-item'
import { rutasNavegacion } from '@/routes/rutas'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

const AprobarRechazarDelegado: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { id, delegadoClubId } = useParams<{
    id: string
    delegadoClubId: string
  }>()
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

  const aprobarMutation = useApiMutation({
    fn: async (dto: AprobarDelegadoEnElClubDTO) => {
      await api.aprobarDelegadoEnElClub(dto)
    },
    antesDeMensajeExito: volverADelegados,
    mensajeDeExito: 'Delegado aprobado'
  })

  const rechazarMutation = useApiMutation({
    fn: async (delegadoId: number) => {
      await api.delegadoDELETE(delegadoId)
    },
    antesDeMensajeExito: volverADelegados,
    mensajeDeExito: 'Delegado eliminado del sistema'
  })

  return (
    <ContenedorCargandoYError estaCargando={isLoading} hayError={isError}>
      {delegado && (
        <Card className='max-w-3xl mx-auto mt-10 p-6 rounded-xl border bg-white'>
          <CardHeader className='flex flex-col items-center text-center'>
            <img
              src={delegado.fotoCarnet}
              alt={`${delegado.nombre} ${delegado.apellido}`}
              className='w-32 h-32 rounded-lg object-cover'
            />
            <h2 className='mt-4 text-3xl font-semibold text-gray-900'>
              {delegado.nombre} {delegado.apellido}
            </h2>
          </CardHeader>

          <CardContent>
            <div className='flex flex-col gap-1 bg-gray-50 p-5 rounded-lg mb-6'>
              <DetalleItem clave='DNI' valor={delegado.dni} />
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

            {delegado.fotoDNIFrente && delegado.fotoDNIDorso && (
              <div className='mb-6'>
                <h2 className='text-xl font-semibold mb-6 text-gray-700'>
                  Documentación
                </h2>
                <div className='flex flex-col gap-9'>
                  <div className='flex flex-col items-center w-full'>
                    <img
                      src={delegado.fotoDNIFrente}
                      alt={`${delegado.nombre} DNI Frente`}
                      className='w-full object-cover rounded-lg mb-2'
                    />
                    <span className='text-sm text-gray-500'>DNI Frente</span>
                  </div>
                  <div className='flex flex-col items-center w-full'>
                    <img
                      src={delegado.fotoDNIDorso}
                      alt={`${delegado.nombre} DNI Dorso`}
                      className='w-full object-cover rounded-lg mb-2'
                    />
                    <span className='text-sm text-gray-500'>DNI Dorso</span>
                  </div>
                </div>
              </div>
            )}

            <div className='mt-8 mb-6 flex gap-6'>
              <Boton
                variant='default'
                className='w-full'
                estaCargando={
                  aprobarMutation.isPending || rechazarMutation.isPending
                }
                disabled={!delegadoClubId}
                onClick={() =>
                  delegadoClubId &&
                  aprobarMutation.mutate(
                    new AprobarDelegadoEnElClubDTO({
                      delegadoClubId: Number(delegadoClubId)
                    })
                  )
                }
              >
                Aprobar
              </Boton>

              <DialogoEliminarDelegado
                descripcion='Tené en cuenta que podés editar cualquiera de sus datos. Si confirmás la eliminación, toda su información se perderá y tendrá que volver a ficharse.'
                delegadoId={delegado.id!}
                onConfirm={(id) => rechazarMutation.mutate(id)}
                estaCargando={
                  aprobarMutation.isPending || rechazarMutation.isPending
                }
                trigger={
                  <Boton
                    variant='destructive'
                    className='w-full'
                    estaCargando={
                      aprobarMutation.isPending || rechazarMutation.isPending
                    }
                  >
                    Rechazar
                  </Boton>
                }
              />
            </div>
          </CardContent>

          <div className='flex justify-end mt-6'>
            <BotonVolver texto='Volver' />
          </div>
        </Card>
      )}
    </ContenedorCargandoYError>
  )
}

export default AprobarRechazarDelegado

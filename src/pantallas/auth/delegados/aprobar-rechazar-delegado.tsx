import { api } from '@/api/api'
import { AprobarDelegadoEnElClubDTO } from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import useApiQuery from '@/api/hooks/use-api-query'
import { ContenedorCargandoYError } from '@/design-system/cargando-y-error-contenedor'
import AprobarRechazarHeaderDelegado from './components/aprobar-rechazar-header-delegado'
import DialogoEliminarDelegado from './components/dialogo-eliminar-delegado'
import { Card, CardContent, CardHeader } from '@/design-system/base-ui/card'
import { Boton } from '@/design-system/ykn-ui/boton'
import BotonVolver from '@/design-system/ykn-ui/boton-volver'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

const AprobarRechazarDelegado: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { id, delegadoClubId } = useParams<{
    id: string
    delegadoClubId: string
  }>()
  const [datosCabecera, setDatosCabecera] =
    useState<AprobarDelegadoEnElClubDTO>()
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
      <div className='mb-4'>
        <BotonVolver path={`${rutasNavegacion.delegados}${location.search}`} />
      </div>
      {delegado && (
        <Card className='max-w-3xl mx-auto mt-10 p-6 rounded-xl border bg-white'>
          <CardHeader className='flex flex-col items-center text-center'>
            <AprobarRechazarHeaderDelegado
              delegado={delegado}
              delegadoClubId={
                delegadoClubId ? Number(delegadoClubId) : undefined
              }
              onChange={setDatosCabecera}
            />
          </CardHeader>

          <CardContent>
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
                disabled={!delegadoClubId || !datosCabecera}
                onClick={() => {
                  if (!datosCabecera) return
                  aprobarMutation.mutate(datosCabecera)
                }}
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
        </Card>
      )}
    </ContenedorCargandoYError>
  )
}

export default AprobarRechazarDelegado

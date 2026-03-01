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
import { estadoBadgeClassDelegado, EstadoDelegado } from '@/lib/utils'
import { rutasNavegacion } from '@/routes/rutas'
import { Building2, User } from 'lucide-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import DialogoEliminarDelegado from './components/dialogo-eliminar-delegado'

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
              {delegado.blanqueoPendiente && (
                <Badge className='px-3 py-1 rounded-md border-gray-700 bg-white text-gray-700'>
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
                valor={
                  delegado.usuario?.nombreUsuario ?? 'Usuario aún no generado'
                }
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

            {delegado.delegadoClubs && delegado.delegadoClubs.length > 0 && (
              <Card className='mb-4 shadow-md'>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-xl font-semibold flex items-center gap-2'>
                    <Building2 className='h-5 w-5' />
                    {delegado.delegadoClubs.length === 1 ? 'Club' : 'Clubs'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className='space-y-2 divide-y divide-gray-100'>
                    {delegado.delegadoClubs.map((dc) => (
                      <li key={dc.id ?? dc.clubId} className='pt-2 first:pt-0'>
                        <div className='flex items-center justify-between gap-2'>
                          <Button
                            variant='ghost'
                            className='flex-1 justify-start font-normal hover:bg-gray-50'
                            onClick={() => {
                              if (
                                dc.estadoDelegado?.id ===
                                  EstadoDelegado.PendienteDeAprobacion &&
                                dc.id != null
                              ) {
                                navigate(
                                  `${rutasNavegacion.aprobarRechazarDelegado}/${delegado.id}/${dc.id}${location.search}`
                                )
                              } else if (dc.clubId != null) {
                                navigate(
                                  `${rutasNavegacion.detalleClub}/${dc.clubId}`
                                )
                              }
                            }}
                          >
                            {dc.clubNombre ?? `Club ${dc.clubId}`}
                          </Button>
                          {dc.estadoDelegado && (
                            <Badge
                              className={`shrink-0 px-3 py-1 rounded-md ${estadoBadgeClassDelegado[dc.estadoDelegado.id!] ?? ''}`}
                            >
                              {dc.estadoDelegado.estado}
                            </Badge>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {delegado.jugadorId != null && (
              <div className='mb-4'>
                <Button
                  variant='ghost'
                  className='w-full justify-start font-normal hover:bg-gray-50'
                  onClick={() =>
                    navigate(
                      `${rutasNavegacion.detalleJugador}/${delegado.jugadorId}`
                    )
                  }
                >
                  <User className='h-4 w-4 mr-2' />
                  Este delegado es jugador →
                </Button>
              </div>
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

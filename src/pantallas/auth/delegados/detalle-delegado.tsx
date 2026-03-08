import { api } from '@/api/api'
import useApiMutation from '@/api/hooks/use-api-mutation'
import useApiQuery from '@/api/hooks/use-api-query'
import { Badge } from '@/design-system/base-ui/badge'
import { Card, CardContent } from '@/design-system/base-ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/design-system/base-ui/tooltip'
import { ContenedorCargandoYError } from '@/design-system/cargando-y-error-contenedor'
import { VisibleSoloParaAdmin } from '@/design-system/visible-solo-para-admin'
import { Boton } from '@/design-system/ykn-ui/boton'
import BotonVolver from '@/design-system/ykn-ui/boton-volver'
import DetalleItem from '@/design-system/ykn-ui/detalle-item'
import Icono from '@/design-system/ykn-ui/icono'
import Link from '@/design-system/ykn-ui/link'
import {
  estadoBadgeClassDelegado,
  EstadoDelegado
} from '@/logica-compartida/utils'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import DialogoBlanquearClaveDelegado from './components/dialogo-blanquear-clave-delegado'
import DialogoEliminarDelegado from './components/dialogo-eliminar-delegado'

export default function DetalleDelegado() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams<{ id: string }>()
  const pathDelegados = `${rutasNavegacion.delegados}${location.search}`

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
    antesDeMensajeExito: () => navigate(pathDelegados),
    mensajeDeExito: 'Delegado eliminado del sistema'
  })

  return (
    <ContenedorCargandoYError
      estaCargando={isLoading}
      hayError={isError}
      mensajeDeError='No se pudieron recuperar los datos del delegado'
    >
      {delegado && (
        <div className='max-w-lg mx-auto px-4'>
          <div className='mb-4'>
            <BotonVolver path={pathDelegados} />
          </div>

          {/* Card1: nombre y foto */}
          <Card className='mb-4 p-6 rounded-xl border bg-white shadow-md'>
            <div className='flex flex-col items-center'>
              <h1 className='w-full text-center text-4xl! font-semibold text-gray-900 wrap-break-word'>
                {delegado.nombre} {delegado.apellido}
              </h1>
              <img
                src={delegado.fotoCarnet}
                alt={`${delegado.nombre} ${delegado.apellido}`}
                className='my-8 w-40 h-40 rounded-lg object-cover'
              />
              {delegado.blanqueoPendiente && (
                <div className='mt-3 flex flex-wrap gap-2 justify-center'>
                  <Badge className='px-3 py-1 rounded-md border-gray-700 bg-white text-gray-700'>
                    Blanqueo pendiente
                  </Badge>
                </div>
              )}
              <VisibleSoloParaAdmin>
                <div className='mt-4 flex gap-2 justify-end w-full'>
                  {delegado.usuario?.nombreUsuario &&
                    !delegado.blanqueoPendiente && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className='inline-flex'>
                            <DialogoBlanquearClaveDelegado
                              delegadoId={delegado.id!}
                              nombreUsuario={delegado.usuario.nombreUsuario}
                              trigger={
                                <Boton
                                  variant='outline'
                                  size='icon'
                                  className='h-10 w-10'
                                >
                                  <Icono nombre='Clave' className='h-5 w-5' />
                                </Boton>
                              }
                            />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent
                          side='bottom'
                          className='max-w-xs text-base px-4 py-3'
                          sideOffset={8}
                        >
                          <p>Blanquear clave</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  <DialogoEliminarDelegado
                    descripcion='Si confirmás la eliminación, toda su información se perderá y tendrá que volver a ficharse.'
                    delegadoId={delegado.id!}
                    onConfirm={(delegadoId) =>
                      eliminarMutation.mutate(delegadoId)
                    }
                    estaCargando={eliminarMutation.isPending}
                    trigger={
                      <Boton
                        variant='outline'
                        size='icon'
                        className='h-10 w-10 border-destructive text-destructive hover:bg-destructive/10'
                      >
                        <Icono nombre='Eliminar' className='h-5 w-5' />
                      </Boton>
                    }
                  />
                </div>
              </VisibleSoloParaAdmin>
            </div>
          </Card>

          {/* Card2: datos */}
          <Card className='mb-4 p-6 rounded-xl border bg-white shadow-md'>
            <CardContent>
              <div className='flex flex-col gap-3'>
                <DetalleItem icono='Carnet' valor={delegado.dni} />
                <DetalleItem
                  icono='Usuario'
                  valor={
                    delegado.usuario?.nombreUsuario ?? 'Usuario aún no generado'
                  }
                />
                <DetalleItem
                  icono='Calendario'
                  valor={delegado.fechaNacimiento.toLocaleDateString('es-AR')}
                />
                {delegado.email && (
                  <DetalleItem icono='Email' valor={delegado.email} />
                )}
                {delegado.telefonoCelular && (
                  <DetalleItem
                    icono='Teléfono'
                    valor={delegado.telefonoCelular}
                  />
                )}
              </div>
              {delegado.jugadorId != null && (
                <div className='mt-4'>
                  <Link
                    to={`${rutasNavegacion.detalleJugador}/${delegado.jugadorId}`}
                    className='inline-flex items-center gap-2'
                  >
                    <Icono nombre='Usuario' className='h-4 w-4' />
                    Este delegado es jugador →
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card3: clubs */}
          {delegado.delegadoClubs && delegado.delegadoClubs.length > 0 && (
            <Card className='mb-4 p-6 rounded-xl border bg-white shadow-md'>
              <CardContent>
                <ul className='space-y-2 divide-y divide-gray-100'>
                  {delegado.delegadoClubs.map((dc) => (
                    <li key={dc.id ?? dc.clubId} className='pt-2 first:pt-0'>
                      <div className='flex items-center justify-between gap-2'>
                        <Boton
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
                        </Boton>
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
        </div>
      )}
    </ContenedorCargandoYError>
  )
}

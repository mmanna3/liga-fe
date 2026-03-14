import { api } from '@/api/api'
import useApiMutation from '@/api/hooks/use-api-mutation'
import useApiQuery from '@/api/hooks/use-api-query'
import {
  Alert,
  AlertDescription,
  AlertTitle
} from '@/design-system/base-ui/alert'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/design-system/base-ui/card'
import { Skeleton } from '@/design-system/base-ui/skeleton'
import { VisibleSoloParaAdmin } from '@/design-system/visible-solo-para-admin'
import { Boton } from '@/design-system/ykn-ui/boton'
import FlujoHomeLayout from '@/design-system/ykn-ui/flujo-home-layout'
import Icono from '@/design-system/ykn-ui/icono'
import MensajeListaVacia from '@/design-system/ykn-ui/mensaje-lista-vacia'
import TorneoBadge from '@/design-system/ykn-ui/torneo-badge'
import { rutasNavegacion } from '@/ruteo/rutas'
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

  const eliminarMutation = useApiMutation<void>({
    fn: async () => {
      await api.clubDELETE(Number(id))
    },
    antesDeMensajeExito: () => navigate(rutasNavegacion.clubs),
    mensajeDeExito: `El club "${club?.nombre ?? ''}" fue eliminado.`
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
      <div className='max-w-4xl mx-auto mt-10 px-4'>
        <Skeleton className='h-16 w-full mb-6' />
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <Skeleton className='h-64 w-full' />
          <Skeleton className='h-64 w-full' />
        </div>
      </div>
    )
  }

  const imagenTitulo = club!.escudo ? (
    <img
      src={
        club!.escudo.startsWith('data:') || club!.escudo.startsWith('http')
          ? club!.escudo
          : `data:image/${club!.escudo.startsWith('/9j/') ? 'jpeg' : 'png'};base64,${club!.escudo}`
      }
      alt={`Escudo de ${club!.nombre}`}
      className='h-16 w-16 object-contain'
    />
  ) : undefined

  return (
    <>
      <FlujoHomeLayout
        titulo={club!.nombre}
        iconoTitulo={imagenTitulo ? undefined : 'Clubes'}
        imagenTitulo={imagenTitulo}
        pathBotonVolver={rutasNavegacion.clubs}
        botonera={{
          iconos: [
            {
              alApretar: () => navigate(`${rutasNavegacion.editarClub}/${id}`),
              tooltip: 'Editar',
              icono: 'Editar',
              visibleSoloParaAdmin: true
            },
            {
              alApretar: () => eliminarMutation.mutate(undefined),
              tooltip: 'Eliminar',
              puedeEliminar: !(club!.equipos && club!.equipos.length > 0),
              textoNoSePuedeEliminar:
                'Este club tiene equipos. Para eliminar el club, eliminá primero los equipos que tiene.',
              modalEliminacion: {
                titulo: 'Eliminar club',
                subtitulo: `¿Estás seguro de que querés eliminar el club "${club!.nombre}"? Esta acción no se puede deshacer.`,
                estaCargando: eliminarMutation.isPending
              }
            }
          ]
        }}
        contenidoEnCard={false}
        contenido={
          <div className='space-y-6'>
            <Card className='shadow-md'>
              <CardContent className='space-y-2'>
                <p className='flex items-center gap-2'>
                  <Icono
                    nombre='Casa'
                    className='h-5 w-5 shrink-0 text-primary'
                  />
                  {[club!.direccion, club!.localidad]
                    .filter(Boolean)
                    .join(', ') || '—'}
                </p>
                <p className='flex items-baseline gap-1 pl-1'>
                  {club!.esTechado ? (
                    <>
                      Tiene techo
                      <Icono
                        nombre='Verificado'
                        className='h-3.5 w-3.5 shrink-0 translate-y-[2px] text-primary'
                      />
                    </>
                  ) : (
                    <>
                      No tiene techo
                      <Icono
                        nombre='Cruz'
                        className='h-3.5 w-3.5 shrink-0 translate-y-[2px] text-destructive'
                      />
                    </>
                  )}
                </p>
              </CardContent>
            </Card>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <Card className='shadow-md'>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-xl font-semibold flex items-center gap-2'>
                    <Icono nombre='Delegados' className='h-5 w-5' />
                    Delegados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {club!.delegados && club!.delegados.length > 0 ? (
                    <ul className='space-y-2 divide-y divide-gray-100'>
                      {club!.delegados.map((delegado) => (
                        <li key={delegado.id} className='pt-2 first:pt-0'>
                          <Boton
                            variant='ghost'
                            className='w-full justify-start font-normal hover:bg-gray-50'
                            onClick={() =>
                              navigate(
                                `${rutasNavegacion.detalleDelegado}/${delegado.id}`
                              )
                            }
                          >
                            {delegado.nombre} {delegado.apellido}
                          </Boton>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <MensajeListaVacia mensaje='No hay delegados registrados' />
                  )}
                </CardContent>
              </Card>

              <Card className='shadow-md'>
                <CardHeader className='pb-3 flex flex-row items-center justify-between'>
                  <CardTitle className='text-xl font-semibold flex items-center gap-2'>
                    <Icono nombre='Equipos' className='h-5 w-5' />
                    Equipos
                  </CardTitle>
                  <VisibleSoloParaAdmin>
                    <Boton
                      onClick={() =>
                        navigate(`${rutasNavegacion.crearEquipo}/${id}`)
                      }
                      variant='outline'
                      size='sm'
                      className='flex items-center gap-1'
                    >
                      <Icono nombre='Agregar equipo' className='h-4 w-4' />
                      Nuevo
                    </Boton>
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
                          <Boton
                            variant='ghost'
                            className='p-0 h-auto text-left font-normal hover:bg-transparent'
                            onClick={() =>
                              navigate(
                                `${rutasNavegacion.detalleEquipo}/${equipo.id}`
                              )
                            }
                          >
                            {equipo.nombre}
                          </Boton>
                          <TorneoBadge zonas={equipo.zonas} />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <MensajeListaVacia mensaje='No hay equipos registrados' />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        }
      />
    </>
  )
}

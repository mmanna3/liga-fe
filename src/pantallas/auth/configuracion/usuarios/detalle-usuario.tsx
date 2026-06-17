import { api } from '@/api/api'
import useApiMutation from '@/api/hooks/use-api-mutation'
import useApiQuery from '@/api/hooks/use-api-query'
import { Card, CardContent } from '@/design-system/base-ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/design-system/base-ui/tooltip'
import { ContenedorCargandoYError } from '@/design-system/cargando-y-error-contenedor'
import { VisibleSoloParaAdmin } from '@/design-system/visible-solo-para-admin'
import { Boton } from '@/design-system/ykn-ui/boton'
import DetalleItem from '@/design-system/ykn-ui/detalle-item'
import FlujoHomeLayout from '@/design-system/ykn-ui/flujo-home-layout'
import Icono from '@/design-system/ykn-ui/icono'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useNavigate, useParams } from 'react-router-dom'
import DialogoBlanquearClaveUsuario from './components/dialogo-blanquear-clave-usuario'
import PermisosModuloLectura from './components/permisos-modulo-lectura'

export default function DetalleUsuario() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const {
    data: usuario,
    isError,
    isLoading
  } = useApiQuery({
    key: ['usuario', id],
    fn: async () => await api.usuarioGET(Number(id))
  })

  const eliminarMutation = useApiMutation({
    fn: async (usuarioId: number) => {
      await api.usuarioDELETE(usuarioId)
    },
    antesDeMensajeExito: () => navigate(rutasNavegacion.usuarios),
    mensajeDeExito: `El usuario "${usuario?.nombreUsuario ?? ''}" fue eliminado.`
  })

  return (
    <ContenedorCargandoYError
      estaCargando={isLoading}
      hayError={isError}
      mensajeDeError='No se pudieron recuperar los datos del usuario'
    >
      {usuario && (
        <FlujoHomeLayout
          titulo={usuario.nombreUsuario}
          iconoTitulo='Usuario'
          pathBotonVolver={rutasNavegacion.usuarios}
          botonera={{
            iconos: [
              {
                alApretar: () =>
                  navigate(`${rutasNavegacion.editarUsuario}/${id}`),
                tooltip: 'Editar',
                icono: 'Editar',
                visibleSoloParaAdmin: true
              },
              {
                alApretar: () => eliminarMutation.mutate(usuario.id!),
                tooltip: 'Eliminar',
                modalEliminacion: {
                  titulo: 'Eliminar usuario',
                  subtitulo: `¿Confirmás que querés eliminar al usuario "${usuario.nombreUsuario}"?`,
                  estaCargando: eliminarMutation.isPending
                }
              }
            ]
          }}
          contenido={
            <Card>
              <CardContent className='pt-6 space-y-4'>
                <DetalleItem clave='Usuario' valor={usuario.nombreUsuario} />
                <DetalleItem clave='Rol' valor={usuario.rolNombre ?? '—'} />
                <DetalleItem
                  clave='Estado'
                  valor={
                    usuario.blanqueoPendiente ? 'Blanqueo pendiente' : 'Activo'
                  }
                />
                <div className='border-t pt-4'>
                  <PermisosModuloLectura
                    accesosModulo={usuario.accesosModulo}
                    esSuperAdministrador={
                      usuario.rolNombre === 'SuperAdministrador'
                    }
                  />
                </div>
                <VisibleSoloParaAdmin>
                  {!usuario.blanqueoPendiente && (
                    <div className='flex justify-end pt-2'>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className='inline-flex'>
                            <DialogoBlanquearClaveUsuario
                              usuarioId={usuario.id!}
                              nombreUsuario={usuario.nombreUsuario}
                              trigger={
                                <Boton variant='outline'>
                                  <Icono
                                    nombre='Clave'
                                    className='h-4 w-4 mr-2'
                                  />
                                  Blanquear clave
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
                          <p>
                            Obliga al usuario a definir una nueva clave en el
                            próximo inicio de sesión
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  )}
                </VisibleSoloParaAdmin>
              </CardContent>
            </Card>
          }
        />
      )}
    </ContenedorCargandoYError>
  )
}

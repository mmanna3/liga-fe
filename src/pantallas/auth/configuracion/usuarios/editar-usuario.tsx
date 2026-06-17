import { api } from '@/api/api'
import { UsuarioAdminDTO } from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import useApiQuery from '@/api/hooks/use-api-query'
import { ContenedorCargandoYError } from '@/design-system/cargando-y-error-contenedor'
import { Boton } from '@/design-system/ykn-ui/boton'
import ContenedorBotones from '@/design-system/ykn-ui/contenedor-botones'
import { Input } from '@/design-system/ykn-ui/input'
import LayoutSegundoNivel from '@/design-system/ykn-ui/layout-segundo-nivel'
import SelectorSimple from '@/design-system/ykn-ui/selector-simple'
import { seleccionDesdeAccesos } from '@/logica-compartida/permisos'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import MatrizPermisosModulo, {
  accesosDesdeSeleccion,
  type SeleccionPermisos
} from './components/matriz-permisos-modulo'

export default function EditarUsuario() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [nombreUsuario, setNombreUsuario] = useState('')
  const [rolId, setRolId] = useState('')
  const [permisos, setPermisos] = useState<SeleccionPermisos>(() =>
    seleccionDesdeAccesos([])
  )

  const {
    data: usuario,
    isError: errorUsuario,
    isLoading: cargandoUsuario
  } = useApiQuery({
    key: ['usuario', id],
    fn: async () => await api.usuarioGET(Number(id))
  })

  const {
    data: roles,
    isError: errorRoles,
    isLoading: cargandoRoles
  } = useApiQuery({
    key: ['roles-asignables'],
    fn: async () => await api.rolesAsignables()
  })

  const mutation = useApiMutation({
    fn: async (usuarioActualizado: UsuarioAdminDTO) => {
      await api.usuarioPUT(Number(id), usuarioActualizado)
    },
    mensajeDeExito: 'Usuario actualizado correctamente'
  })

  useEffect(() => {
    if (usuario) {
      setNombreUsuario(usuario.nombreUsuario || '')
      setRolId(String(usuario.rolId))
      setPermisos(seleccionDesdeAccesos(usuario.accesosModulo))
    }
  }, [usuario])

  const accesosActuales = accesosDesdeSeleccion(permisos)
  const accesosOriginales = usuario?.accesosModulo ?? []

  const permisosCambiaron =
    accesosActuales.length !== accesosOriginales.length ||
    accesosActuales.some(
      (a) =>
        !accesosOriginales.some(
          (o) => o.modulo === a.modulo && o.nivel === a.nivel
        )
    )

  const hayCambios =
    !!usuario &&
    (nombreUsuario.trim().toLowerCase() !== usuario.nombreUsuario ||
      Number(rolId) !== usuario.rolId ||
      permisosCambiaron)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!usuario || !rolId || !hayCambios) return

    await mutation.mutateAsync(
      new UsuarioAdminDTO({
        id: usuario.id,
        nombreUsuario: nombreUsuario.trim().toLowerCase(),
        rolId: Number(rolId),
        accesosModulo: accesosActuales
      })
    )
    navigate(`${rutasNavegacion.detalleUsuario}/${id}`)
  }

  return (
    <ContenedorCargandoYError
      estaCargando={cargandoUsuario || cargandoRoles}
      hayError={errorUsuario || errorRoles}
      mensajeDeError='No se pudieron recuperar los datos del usuario'
    >
      <LayoutSegundoNivel
        titulo='Editar usuario'
        maxWidth='2xl'
        pathBotonVolver={`${rutasNavegacion.detalleUsuario}/${id}`}
        contenido={
          <form onSubmit={handleSubmit} className='space-y-4'>
            <Input
              titulo='Nombre de usuario'
              id='nombreUsuario'
              type='text'
              icono='Usuario'
              placeholder='ej: juan.perez'
              value={nombreUsuario}
              onChange={(e) => setNombreUsuario(e.target.value)}
              maxLength={14}
              required
            />
            {roles && roles.length > 0 && (
              <SelectorSimple
                titulo='Rol'
                opciones={roles.map((rol) => ({
                  id: String(rol.id),
                  titulo: rol.nombre ?? ''
                }))}
                valorActual={rolId}
                alElegirOpcion={setRolId}
                columnasPorRenglon={roles.length <= 3 ? roles.length : 3}
              />
            )}
            <MatrizPermisosModulo valor={permisos} onChange={setPermisos} />
            <ContenedorBotones>
              <Boton
                type='submit'
                estaCargando={mutation.isPending}
                disabled={!usuario || !rolId || !hayCambios}
              >
                Guardar
              </Boton>
            </ContenedorBotones>
          </form>
        }
      />
    </ContenedorCargandoYError>
  )
}

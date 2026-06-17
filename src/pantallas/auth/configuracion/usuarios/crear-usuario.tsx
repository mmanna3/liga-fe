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
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MatrizPermisosModulo, {
  accesosDesdeSeleccion,
  type SeleccionPermisos
} from './components/matriz-permisos-modulo'

export default function CrearUsuario() {
  const navigate = useNavigate()
  const [nombreUsuario, setNombreUsuario] = useState('')
  const [rolId, setRolId] = useState('')
  const [permisos, setPermisos] = useState<SeleccionPermisos>(() =>
    seleccionDesdeAccesos([])
  )

  const {
    data: roles,
    isLoading,
    isError
  } = useApiQuery({
    key: ['roles-asignables'],
    fn: async () => await api.rolesAsignables()
  })

  const mutation = useApiMutation({
    fn: async (nuevoUsuario: UsuarioAdminDTO) => {
      await api.usuarioPOST(nuevoUsuario)
    },
    antesDeMensajeExito: () => navigate(rutasNavegacion.usuarios),
    mensajeDeExito: `Usuario '${nombreUsuario}' creado correctamente`
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!rolId) return

    mutation.mutate(
      new UsuarioAdminDTO({
        nombreUsuario: nombreUsuario.trim().toLowerCase(),
        rolId: Number(rolId),
        accesosModulo: accesosDesdeSeleccion(permisos)
      })
    )
  }

  return (
    <ContenedorCargandoYError
      estaCargando={isLoading}
      hayError={isError}
      mensajeDeError='No se pudieron cargar los roles disponibles'
    >
      <LayoutSegundoNivel
        titulo='Agregar usuario'
        maxWidth='2xl'
        pathBotonVolver={rutasNavegacion.usuarios}
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
            <p className='text-muted-foreground text-sm -mt-2'>
              La clave quedará pendiente de definir en el primer inicio de
              sesión.
            </p>
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
                disabled={!rolId}
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

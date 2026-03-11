import { api } from '@/api/api'
import useApiMutation from '@/api/hooks/use-api-mutation'
import useApiQuery from '@/api/hooks/use-api-query'
import LayoutSegundoNivel from '@/design-system/ykn-ui/layout-segundo-nivel'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useNavigate, useParams } from 'react-router-dom'

export default function DetalleTorneo() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const {
    data: torneo,
    isLoading,
    isError
  } = useApiQuery({
    key: ['torneo', id],
    fn: async () => await api.torneoGET(Number(id))
  })

  const { data: fases, isLoading: isLoadingFases } = useApiQuery({
    key: ['torneo', id, 'fases'],
    fn: async () => await api.fasesAll(Number(id)),
    activado: !!id && !!torneo
  })

  const eliminarMutation = useApiMutation<void>({
    fn: async () => {
      await api.torneoDELETE(Number(id))
    },
    antesDeMensajeExito: () => navigate(rutasNavegacion.torneos),
    mensajeDeExito: `El torneo "${torneo?.nombre ?? ''}" fue eliminado.`
  })

  if (isLoading) return <div>Cargando...</div>
  if (isError) return <div>Error al cargar el torneo</div>
  if (!torneo) return <div>No se encontró el torneo</div>

  const tieneFases = (fases?.length ?? 0) > 0
  const puedeEliminar = !isLoadingFases && !tieneFases

  return (
    <>
      <LayoutSegundoNivel
        titulo={`Detalle del Torneo: ${torneo.nombre}`}
        pathBotonVolver={rutasNavegacion.torneos}
        maxWidth='lg'
        botonera={{
          iconos: [
            {
              alApretar: () => eliminarMutation.mutate(undefined),
              tooltip: 'Eliminar',
              puedeEliminar,
              textoNoSePuedeEliminar:
                'Este torneo tiene fases. Para eliminar el torneo, eliminá primero las fases que tiene.',
              modalEliminacion: {
                titulo: 'Eliminar torneo',
                subtitulo: `¿Estás seguro de que querés eliminar el torneo "${torneo.nombre}"? Esta acción no se puede deshacer.`,
                estaCargando: eliminarMutation.isPending
              }
            }
          ]
        }}
        contenido={
          <div className='space-y-4'>
            <div>
              <p className='text-muted-foreground'>
                Año: {torneo.anio}
                {torneo.torneoAgrupadorNombre && (
                  <> · Agrupador: {torneo.torneoAgrupadorNombre}</>
                )}
              </p>
            </div>
          </div>
        }
      />
    </>
  )
}

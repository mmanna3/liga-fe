import { api } from '@/api/api'
import { EquipoDTO } from '@/api/clients'
import useApiMutation from '@/api/custom-hooks/use-api-mutation'
import type { BotoneraProps } from '@/components/ykn-ui/botonera'
import { generarReportePDF } from '@/pages/admin/equipo/components/reporte-jugadores-pdf'
import { rutasNavegacion } from '@/routes/rutas'
import { Download, Pencil, Trash2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

interface UseBotoneraDetalleEquipoArgs {
  equipo: EquipoDTO
  jugadores: string
}

export function useBotoneraDetalleEquipo({
  equipo,
  jugadores
}: UseBotoneraDetalleEquipoArgs): BotoneraProps {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const eliminarMutation = useApiMutation<void>({
    fn: async () => {
      await api.equipoDELETE(Number(id))
    },
    antesDeMensajeExito: () =>
      navigate(
        equipo?.clubId
          ? `${rutasNavegacion.detalleClub}/${equipo.clubId}`
          : rutasNavegacion.equipos
      ),
    mensajeDeExito: `El equipo '${equipo?.nombre}' fue eliminado.`
  })

  if (!equipo?.id) {
    return { iconos: [] }
  }

  return {
    iconos: [
      {
        alApretar: () => generarReportePDF(equipo),
        tooltip: 'Generar Reporte PDF',
        icono: Download
      },
      {
        alApretar: () =>
          navigate(`${rutasNavegacion.editarEquipo}/${equipo.id}`),
        tooltip: 'Editar',
        icono: Pencil,
        visibleSoloParaAdmin: true
      },
      {
        alApretar: () => eliminarMutation.mutate(),
        tooltip: 'Eliminar equipo',
        icono: Trash2,
        visibleSoloParaAdmin: true,
        esEliminar: true,
        modalEliminacion: {
          titulo: `Eliminar definitivamente al equipo ${equipo.nombre}`,
          subtitulo: `Al eliminar el equipo, se eliminarán también los jugadores que solo jueguen en este equipo. Son: ${jugadores}`,
          eliminarTexto: 'Eliminar definitivamente equipo y jugadores',
          estaCargando: eliminarMutation.isPending
        }
      }
    ],
    classNameBotonVolver: '-ml-2'
  }
}

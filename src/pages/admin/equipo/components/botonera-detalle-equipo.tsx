import { api } from '@/api/api'
import { EquipoDTO } from '@/api/clients'
import useApiMutation from '@/api/custom-hooks/use-api-mutation'
import { CardTitle } from '@/components/ui/card'
import Botonera from '@/components/ykn-ui/botonera'
import { generarReportePDF } from '@/pages/admin/equipo/components/reporte-jugadores-pdf'
import { rutasNavegacion } from '@/routes/rutas'
import { FileDown, Pencil, Trash2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

interface BotoneraDetalleEquipoProps {
  equipo: EquipoDTO
  jugadores: string
}

export default function BotoneraDetalleEquipo({
  equipo,
  jugadores
}: BotoneraDetalleEquipoProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const eliminarMutation = useApiMutation<void>({
    fn: async () => {
      await api.equipoDELETE(Number(id))
    },
    antesDeMensajeExito: () =>
      navigate(
        equipo.clubId
          ? `${rutasNavegacion.detalleClub}/${equipo.clubId}`
          : rutasNavegacion.equipos
      ),
    mensajeDeExito: `El equipo '${equipo.nombre}' fue eliminado.`
  })

  return (
    <Botonera
      iconos={[
        {
          alApretar: () => generarReportePDF(equipo),
          tooltip: 'Generar Reporte PDF',
          icono: FileDown
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
      ]}
      classNameBotonVolver='-ml-2'
    >
      <CardTitle>{equipo.nombre}</CardTitle>
    </Botonera>
  )
}

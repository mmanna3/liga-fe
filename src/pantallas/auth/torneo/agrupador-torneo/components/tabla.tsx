import { api } from '@/api/api'
import { TorneoAgrupadorDTO } from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import { BotonEliminar } from '@/design-system/ykn-ui/boton-eliminar'
import Tabla from '@/design-system/ykn-ui/tabla'
import { rutasNavegacion } from '@/ruteo/rutas'
import { ColumnDef } from '@tanstack/react-table'
import { useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

interface ITablaAgrupadorTorneo {
  data: TorneoAgrupadorDTO[]
  isLoading: boolean
  isError: boolean
}

/** Misma anchura reservada con o sin botón para alinear columnas de datos. */
const anchoColumnaAcciones = 'w-12 min-w-12'

function sinTorneos(row: TorneoAgrupadorDTO): boolean {
  return (row.cantidadDeTorneos ?? 0) === 0
}

export default function TablaAgrupadorTorneo({
  data,
  isLoading,
  isError
}: ITablaAgrupadorTorneo) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const eliminarMutation = useApiMutation<number>({
    fn: async (id) => {
      await api.torneoAgrupadorDELETE(id)
    },
    mensajeDeExito: 'Agrupador eliminado',
    antesDeMensajeExito: () => {
      queryClient.invalidateQueries({ queryKey: ['torneoAgrupadores'] })
    },
    mensajeDeError: 'No se pudo eliminar el agrupador'
  })

  const columnas: ColumnDef<TorneoAgrupadorDTO>[] = useMemo(
    () => [
      {
        accessorKey: 'nombre',
        header: 'Nombre',
        cell: ({ row }) => <span>{row.getValue('nombre')}</span>
      },
      {
        accessorKey: 'color',
        header: 'Color',
        cell: ({ row }) => <span>{row.original.color?.trim() || '—'}</span>
      },
      {
        accessorKey: 'esVisibleEnApp',
        header: 'Visible en app',
        cell: ({ row }) => (
          <span>{row.original.esVisibleEnApp ? 'Sí' : 'No'}</span>
        )
      },
      {
        accessorKey: 'cantidadDeTorneos',
        header: 'Torneos',
        cell: ({ row }) => <span>{row.original.cantidadDeTorneos ?? 0}</span>
      },
      {
        id: 'acciones',
        enableSorting: false,
        header: () => (
          <div className={`${anchoColumnaAcciones} shrink-0`} aria-hidden />
        ),
        cell: ({ row }) => {
          const mostrarEliminar = sinTorneos(row.original)
          return (
            <div
              className={`flex h-9 ${anchoColumnaAcciones} shrink-0 items-center justify-end pr-0.5`}
              onClick={(e) => e.stopPropagation()}
            >
              {mostrarEliminar && row.original.id != null ? (
                <BotonEliminar
                  titulo='Eliminar agrupador'
                  subtitulo={`¿Eliminar «${row.original.nombre}»? No tiene torneos asociados. Esta acción no se puede deshacer.`}
                  onEliminar={() => eliminarMutation.mutate(row.original.id!)}
                  estaCargando={
                    eliminarMutation.isPending &&
                    eliminarMutation.variables === row.original.id
                  }
                  tooltip={`Eliminar agrupador ${row.original.nombre}`}
                  variant='ghost'
                  compacto
                />
              ) : null}
            </div>
          )
        }
      }
    ],
    [eliminarMutation]
  )

  return (
    <Tabla<TorneoAgrupadorDTO>
      columnas={columnas}
      data={data || []}
      estaCargando={isLoading}
      hayError={isError}
      onRowClick={(row) =>
        navigate(`${rutasNavegacion.editarAgrupadorTorneo}/${row.original.id}`)
      }
    />
  )
}

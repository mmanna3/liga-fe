import { api } from '@/api/api'
import { TorneoAgrupadorDTO } from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/design-system/base-ui/alert-dialog'
import { Boton } from '@/design-system/ykn-ui/boton'
import Icono from '@/design-system/ykn-ui/icono'
import Tabla from '@/design-system/ykn-ui/tabla'
import { rutasNavegacion } from '@/ruteo/rutas'
import { ColumnDef } from '@tanstack/react-table'
import { useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
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
  const [agrupadorAEliminar, setAgrupadorAEliminar] =
    useState<TorneoAgrupadorDTO | null>(null)

  const eliminarMutation = useApiMutation<number>({
    fn: async (id) => {
      await api.torneoAgrupadorDELETE(id)
    },
    mensajeDeExito: 'Agrupador eliminado',
    antesDeMensajeExito: () => {
      queryClient.invalidateQueries({ queryKey: ['torneoAgrupadores'] })
      setAgrupadorAEliminar(null)
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
        accessorKey: 'visibleEnApp',
        header: 'Visible en app',
        cell: ({ row }) => (
          <span>{row.original.visibleEnApp ? 'Sí' : 'No'}</span>
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
            >
              {mostrarEliminar ? (
                <button
                  type='button'
                  className='inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive'
                  aria-label={`Eliminar agrupador ${row.original.nombre}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    setAgrupadorAEliminar(row.original)
                  }}
                >
                  <Icono nombre='Eliminar' className='size-4' />
                </button>
              ) : null}
            </div>
          )
        }
      }
    ],
    []
  )

  return (
    <>
      <Tabla<TorneoAgrupadorDTO>
        columnas={columnas}
        data={data || []}
        estaCargando={isLoading}
        hayError={isError}
        onRowClick={(row) =>
          navigate(
            `${rutasNavegacion.editarAgrupadorTorneo}/${row.original.id}`
          )
        }
      />

      <AlertDialog
        open={agrupadorAEliminar != null}
        onOpenChange={(open) => {
          if (!open) setAgrupadorAEliminar(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar agrupador</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Eliminar «{agrupadorAEliminar?.nombre ?? ''}»? No tiene torneos
              asociados. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={eliminarMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <Boton
              type='button'
              variant='destructive'
              disabled={
                eliminarMutation.isPending || agrupadorAEliminar?.id == null
              }
              estaCargando={eliminarMutation.isPending}
              onClick={() => {
                if (agrupadorAEliminar?.id != null) {
                  eliminarMutation.mutate(agrupadorAEliminar.id)
                }
              }}
            >
              Eliminar
            </Boton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

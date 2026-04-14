import { api } from '@/api/api'
import { ConfiguracionDTO } from '@/api/clients'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/design-system/base-ui/dialog'
import Icono from '@/design-system/ykn-ui/icono'
import SelectorSimple, {
  type OpcionSelector
} from '@/design-system/ykn-ui/selector-simple'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

/** IDs del backend: 1=Habilitado, 2=Deshabilitado, 3=Programado */
const OPCIONES_HABILITACION_FICHAJE: OpcionSelector[] = [
  { id: '1', titulo: 'Habilitado' },
  { id: '2', titulo: 'Deshabilitado' },
  { id: '3', titulo: 'Programado' }
]

interface ModalHabilitacionFichajeProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ModalHabilitacionFichaje({
  open,
  onOpenChange
}: ModalHabilitacionFichajeProps) {
  const queryClient = useQueryClient()

  const {
    data: configuraciones,
    isPending: configuracionCargando,
    isError: configuracionError
  } = useQuery({
    queryKey: ['configuracion'],
    queryFn: () => api.configuracionAll(),
    enabled: open
  })

  const configuracion = configuraciones?.[0]

  const { mutate: actualizarHabilitacionFichaje, isPending: fichajePending } =
    useMutation({
      mutationFn: ({
        id,
        habilitacionFichajeId
      }: {
        id: number
        habilitacionFichajeId: number
      }) =>
        api.configuracionPUT(
          id,
          new ConfiguracionDTO({ id, habilitacionFichajeId })
        ),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ['configuracion'] })
      }
    })

  const habilitacionFichajeId = configuracion?.habilitacionFichajeId ?? 2

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>Habilitación de fichaje</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col gap-4'>
          <p className='text-sm text-muted-foreground'>
            <span className='font-medium text-foreground'>Programado:</span> el
            fichaje se habilitará automáticamente los lunes a las 8:00 y se
            desactivará los jueves a las 20:00.
          </p>
          {configuracionCargando && (
            <p className='text-sm text-muted-foreground'>Cargando…</p>
          )}
          {configuracionError && (
            <p className='text-sm text-destructive'>
              No se pudo cargar la configuración.
            </p>
          )}
          {!configuracionCargando &&
            !configuracionError &&
            configuracion?.id == null && (
              <p className='text-sm text-muted-foreground'>
                No hay registro de configuración.
              </p>
            )}
          {!configuracionCargando &&
            !configuracionError &&
            configuracion?.id != null && (
              <div className='flex flex-col gap-2 sm:flex-row sm:items-start'>
                <SelectorSimple
                  titulo='Modo'
                  opciones={OPCIONES_HABILITACION_FICHAJE}
                  valorActual={String(habilitacionFichajeId)}
                  columnasPorRenglon={3}
                  alElegirOpcion={(id) =>
                    actualizarHabilitacionFichaje({
                      id: configuracion.id!,
                      habilitacionFichajeId: Number(id)
                    })
                  }
                  deshabilitado={fichajePending}
                  className='flex-1'
                />
                {fichajePending && (
                  <Icono
                    nombre='Cargando'
                    className='h-4 w-4 animate-spin shrink-0 sm:mt-9'
                  />
                )}
              </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

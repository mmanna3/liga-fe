import { api } from '@/api/api'
import { ConfiguracionDTO } from '@/api/clients'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/design-system/base-ui/card'
import FlujoHomeLayout from '@/design-system/ykn-ui/flujo-home-layout'
import Icono from '@/design-system/ykn-ui/icono'
import SelectorSimple, {
  type OpcionSelector
} from '@/design-system/ykn-ui/selector-simple'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ModalDnisExpulsadosDeLaLiga from './modal-dnis-expulsados-de-la-liga'

/** IDs del backend: 1=Habilitado, 2=Deshabilitado, 3=Programado */
const OPCIONES_HABILITACION_FICHAJE: OpcionSelector[] = [
  { id: '1', titulo: 'Habilitado' },
  { id: '2', titulo: 'Deshabilitado' },
  { id: '3', titulo: 'Programado' }
]

export default function Configuracion() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [modalDnisExpulsadosAbierto, setModalDnisExpulsadosAbierto] =
    useState(false)

  const {
    data: configuraciones,
    isPending: configuracionCargando,
    isError: configuracionError
  } = useQuery({
    queryKey: ['configuracion'],
    queryFn: () => api.configuracionAll()
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
    <FlujoHomeLayout
      titulo='Configuración'
      iconoTitulo='Configuracion'
      ocultarBotonVolver
      contenidoEnCard={false}
      contenido={
        <>
          <div className='grid grid-cols-2 gap-4 py-6'>
            <Card className='col-span-2'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Icono nombre='Carnet' className='h-8 w-8' />
                  Habilitación de fichaje
                </CardTitle>
                <CardDescription className='space-y-2'>
                  <p>
                    Definí si el fichaje de jugadores y delegados en la app está
                    siempre disponible, deshabilitado o con horario automático.
                  </p>
                  <p>
                    <span className='font-medium text-foreground'>
                      Programado:
                    </span>{' '}
                    el fichaje se habilitará automáticamente los lunes a las
                    8:00 y se desactivará los jueves a las 20:00.
                  </p>
                </CardDescription>
              </CardHeader>
              <div className='px-6 pb-6 flex flex-col gap-3'>
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
            </Card>

            <Card
              className='cursor-pointer transition-colors hover:bg-muted/50'
              role='button'
              tabIndex={0}
              onClick={() => navigate(rutasNavegacion.generacionDeFixtures)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') e.currentTarget.click()
              }}
            >
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Icono nombre='Fixture' className='h-8 w-8' />
                  Generación de fixture
                </CardTitle>
                <CardDescription>
                  Gestioná algoritmos de generación de fixture para distintas
                  cantidades de equipos.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card
              className='cursor-pointer transition-colors hover:bg-muted/50'
              role='button'
              tabIndex={0}
              onClick={() => setModalDnisExpulsadosAbierto(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') e.currentTarget.click()
              }}
            >
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Icono nombre='DNIsExpulsados' className='h-8 w-8' />
                  DNIs expulsados de la liga
                </CardTitle>
                <CardDescription>
                  Gestioná los DNIs de jugadores y/o delegados que no pueden
                  volver a ficharse en la liga.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
          <ModalDnisExpulsadosDeLaLiga
            open={modalDnisExpulsadosAbierto}
            onOpenChange={setModalDnisExpulsadosAbierto}
          />
        </>
      }
    />
  )
}

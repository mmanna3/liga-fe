import { api } from '@/api/api'
import { TorneoDTO } from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import { Button } from '@/design-system/base-ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/design-system/base-ui/card'
import { Boton } from '@/design-system/ykn-ui/boton'
import BotonVolver from '@/design-system/ykn-ui/boton-volver'
import { rutasNavegacion } from '@/ruteo/rutas'
import { FormProvider } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { IndicadorDePasos } from './crear-torneo/components/indicador-de-pasos'
import ModalCambiosDetectadosEnEdicion from './crear-torneo/components/ModalCambiosDetectadosEnEdicion'
import { Paso1Informacion } from './crear-torneo/components/paso-1-informacion'
import { Paso2Fases } from './crear-torneo/components/paso-2-fases'
import { Paso3Equipos } from './crear-torneo/components/paso-3-equipos'
import { Paso4Zonas } from './crear-torneo/components/paso-4-zonas'
import { Paso5Fixture } from './crear-torneo/components/paso-5-fixture'
import { Paso6Resumen } from './crear-torneo/components/paso-6-resumen'
import { useNavegacionWizard } from './crear-torneo/use-navegacion-wizard'

export default function CrearTorneo() {
  const navigate = useNavigate()

  const {
    methods,
    pasoActual,
    maxPasoAlcanzado,
    confirmacionAbierta,
    accionPendienteRef,
    alSiguiente,
    alAnterior,
    alClickearPaso,
    alEditarPaso,
    alRevertir,
    alConfirmarYLimpiar
  } = useNavegacionWizard()

  const mutacion = useApiMutation({
    fn: async (nuevoTorneo: TorneoDTO) => {
      await api.torneoPOST(nuevoTorneo)
    },
    antesDeMensajeExito: () => navigate(rutasNavegacion.torneos),
    mensajeDeExito: 'Torneo creado correctamente'
  })

  const alEnviar = methods.handleSubmit((datos) => {
    const nombre =
      datos.nombre || `Torneo ${datos.temporada} - ${datos.tipo || 'General'}`
    mutacion.mutate(new TorneoDTO({ nombre }))
  })

  return (
    <FormProvider {...methods}>
      <Card className='max-w-5xl mx-auto'>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle>Crear nuevo torneo</CardTitle>
            <CardDescription>
              Completa los siguientes pasos para configurar tu torneo
            </CardDescription>
          </div>
          <BotonVolver
            path={rutasNavegacion.torneos}
            texto='Volver a torneos'
            onBeforeNavigate={() =>
              window.confirm(
                'Los cambios de este torneo se van a perder. ¿Estás seguro de que deseas salir?'
              )
            }
          />
        </CardHeader>
        <CardContent className='space-y-6'>
          <IndicadorDePasos
            pasoActual={pasoActual}
            maxPasoAlcanzado={maxPasoAlcanzado}
            totalPasos={6}
            alClickearPaso={alClickearPaso}
          />

          <div>
            {pasoActual === 1 && <Paso1Informacion />}
            {pasoActual === 2 && <Paso2Fases />}
            {pasoActual === 3 && <Paso3Equipos />}
            {pasoActual === 4 && <Paso4Zonas />}
            {pasoActual === 5 && <Paso5Fixture />}
            {pasoActual === 6 && <Paso6Resumen alEditarPaso={alEditarPaso} />}
          </div>

          <ModalCambiosDetectadosEnEdicion
            open={confirmacionAbierta}
            onOpenChange={(open) => {
              if (!open) accionPendienteRef.current = null
            }}
            onRevertir={alRevertir}
            onConfirmarYLimpiar={alConfirmarYLimpiar}
          />

          <div className='flex justify-between pt-4 border-t'>
            {pasoActual === 1 ? (
              <div />
            ) : (
              <Button
                type='button'
                className='h-11 w-28 text-sm'
                variant='outline'
                onClick={alAnterior}
              >
                Anterior
              </Button>
            )}

            {pasoActual < 6 ? (
              <Button
                type='button'
                className='h-11 w-28 text-sm'
                onClick={alSiguiente}
              >
                Siguiente
              </Button>
            ) : (
              <Boton
                type='button'
                className='h-11 w-28 text-sm'
                onClick={alEnviar}
                estaCargando={mutacion.isPending}
              >
                Crear torneo
              </Boton>
            )}
          </div>
        </CardContent>
      </Card>
    </FormProvider>
  )
}

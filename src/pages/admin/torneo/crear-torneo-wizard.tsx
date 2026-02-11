import { useNavigate } from 'react-router-dom'
import { useForm, FormProvider } from 'react-hook-form'
import { api } from '@/api/api'
import { TorneoDTO } from '@/api/clients'
import useApiMutation from '@/api/custom-hooks/use-api-mutation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Boton } from '@/components/ykn-ui/boton'
import BotonVolver from '@/components/ykn-ui/boton-volver'
import { rutasNavegacion } from '@/routes/rutas'
import { StepIndicator } from './wizard/components/StepIndicator'
import { Step1Information } from './wizard/components/Step1Information'
import { Step2Phases } from './wizard/components/Step2Phases'
import { Step3Teams } from './wizard/components/Step3Teams'
import { Step4Zones } from './wizard/components/Step4Zones'
import { Step5Fixture } from './wizard/components/Step5Fixture'
import { Step6Summary } from './wizard/components/Step6Summary'
import { useWizardStore } from './wizard/use-wizard-store'
import type { TournamentWizardData } from './wizard/types'

const initialData: TournamentWizardData = {
  name: '',
  season: new Date().getFullYear().toString(),
  type: '',
  categories: [],
  format: '',
  phases: [],
  sumAnnualPoints: false,
  currentPhaseIndex: 0,
  teamCount: 16,
  selectedTeams: [],
  searchMode: 'name',
  filterTournament: '',
  filterZone: '',
  zones: [],
  zonesCount: 1,
  preventSameClub: false,
  hasFreeBye: false,
  hasInterzonal: false,
  fixtureGenerated: false,
  numberOfDates: 0,
  preventClubClash: false,
  status: 'draft'
}

export default function CrearTorneoWizard() {
  const navigate = useNavigate()
  const { currentStep, nextStep, prevStep, goToStep } = useWizardStore()

  const methods = useForm<TournamentWizardData>({
    defaultValues: initialData,
    mode: 'onChange'
  })

  const mutation = useApiMutation({
    fn: async (nuevoTorneo: TorneoDTO) => {
      await api.torneoPOST(nuevoTorneo)
    },
    antesDeMensajeExito: () => navigate(rutasNavegacion.torneos),
    mensajeDeExito: 'Torneo creado correctamente'
  })

  const handleNext = () => {
    const zonesCount = methods.watch('zonesCount')
    nextStep(zonesCount)
  }

  const handlePrev = () => {
    const zonesCount = methods.watch('zonesCount')
    prevStep(zonesCount)
  }

  const handleSubmit = methods.handleSubmit((data) => {
    const nombre =
      data.name || `Torneo ${data.season} - ${data.type || 'General'}`
    mutation.mutate(new TorneoDTO({ nombre }))
  })

  return (
    <FormProvider {...methods}>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle>Crear nuevo torneo</CardTitle>
            <CardDescription>
              Completa los siguientes pasos para configurar tu torneo
            </CardDescription>
          </div>
          <BotonVolver path={rutasNavegacion.torneos} />
        </CardHeader>
        <CardContent className='space-y-6'>
          <StepIndicator
            currentStep={currentStep}
            totalSteps={6}
            onStepClick={goToStep}
          />

          <div>
            {currentStep === 1 && <Step1Information />}
            {currentStep === 2 && <Step2Phases />}
            {currentStep === 3 && <Step3Teams />}
            {currentStep === 4 && <Step4Zones />}
            {currentStep === 5 && <Step5Fixture />}
            {currentStep === 6 && <Step6Summary />}
          </div>

          <div className='flex justify-between pt-4 border-t'>
            {currentStep === 1 ? (
              <div />
            ) : (
              <Button type='button' variant='outline' onClick={handlePrev}>
                Anterior
              </Button>
            )}

            {currentStep < 6 ? (
              <Button type='button' onClick={handleNext}>
                Siguiente
              </Button>
            ) : (
              <Boton
                type='button'
                onClick={handleSubmit}
                estaCargando={mutation.isPending}
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

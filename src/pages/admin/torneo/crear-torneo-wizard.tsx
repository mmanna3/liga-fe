import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const [currentStep, setCurrentStep] = useState(1)
  const [tournamentData, setTournamentData] =
    useState<TournamentWizardData>(initialData)

  const mutation = useApiMutation({
    fn: async (nuevoTorneo: TorneoDTO) => {
      await api.torneoPOST(nuevoTorneo)
    },
    antesDeMensajeExito: () => navigate(rutasNavegacion.torneos),
    mensajeDeExito: 'Torneo creado correctamente'
  })

  const updateData = (field: Partial<TournamentWizardData>) => {
    setTournamentData({ ...tournamentData, ...field })
  }

  const nextStep = () => {
    if (currentStep === 3 && tournamentData.zonesCount === 1) {
      setCurrentStep(5)
    } else if (currentStep < 6) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep === 5 && tournamentData.zonesCount === 1) {
      setCurrentStep(3)
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = (step: number) => {
    setCurrentStep(step)
  }

  const handleSubmit = () => {
    const nombre =
      tournamentData.name ||
      `Torneo ${tournamentData.season} - ${tournamentData.type || 'General'}`
    mutation.mutate(new TorneoDTO({ nombre }))
  }

  return (
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
          {currentStep === 1 && (
            <Step1Information
              data={tournamentData}
              updateData={updateData}
            />
          )}
          {currentStep === 2 && (
            <Step2Phases data={tournamentData} updateData={updateData} />
          )}
          {currentStep === 3 && (
            <Step3Teams data={tournamentData} updateData={updateData} />
          )}
          {currentStep === 4 && (
            <Step4Zones data={tournamentData} updateData={updateData} />
          )}
          {currentStep === 5 && (
            <Step5Fixture data={tournamentData} updateData={updateData} />
          )}
          {currentStep === 6 && (
            <Step6Summary
              data={tournamentData}
              updateData={updateData}
              goToStep={goToStep}
            />
          )}
        </div>

        <div className='flex justify-between pt-4 border-t'>
          {currentStep === 1 ? (
            <div />
          ) : (
            <Button type='button' variant='outline' onClick={prevStep}>
              Anterior
            </Button>
          )}

          {currentStep < 6 ? (
            <Button type='button' onClick={nextStep}>
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
  )
}

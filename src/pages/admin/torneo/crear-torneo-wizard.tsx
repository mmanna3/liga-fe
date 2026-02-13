import { api } from '@/api/api'
import { TorneoDTO } from '@/api/clients'
import useApiMutation from '@/api/custom-hooks/use-api-mutation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
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
import { zodResolver } from '@hookform/resolvers/zod'
import { useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { Step1Information } from './wizard/components/Step1Information'
import { Step2Phases } from './wizard/components/Step2Phases'
import { Step3Teams } from './wizard/components/Step3Teams'
import { Step4Zones } from './wizard/components/Step4Zones'
import { Step5Fixture } from './wizard/components/Step5Fixture'
import { Step6Summary } from './wizard/components/Step6Summary'
import { StepIndicator } from './wizard/components/StepIndicator'
import type { TournamentWizardData } from './wizard/types'
import { useWizardStore } from './wizard/use-wizard-store'
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  tournamentWizardSchema
} from './wizard/validation-schema'

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
  filterYear: '',
  filterType: '',
  filterTournament: '',
  filterPhase: '',
  filterZone: '',
  zones: [],
  zonesCount: 1,
  preventSameClub: false,
  freeDates: 0,
  interzonalDates: 0,
  fixtureGenerated: false,
  preventClubClash: false,
  status: 'draft'
}

/** Extrae los datos relevantes de un paso para comparación/snapshot */
function getStepData(data: TournamentWizardData, step: number): unknown {
  switch (step) {
    case 1:
      return {
        name: data.name,
        season: data.season,
        type: data.type,
        categories: data.categories,
        format: data.format
      }
    case 2:
      return { phases: data.phases }
    case 3:
      return {
        teamCount: data.teamCount,
        selectedTeams: data.selectedTeams,
        searchMode: data.searchMode,
        filterYear: data.filterYear,
        filterType: data.filterType,
        filterTournament: data.filterTournament,
        filterPhase: data.filterPhase,
        filterZone: data.filterZone
      }
    case 4:
      return { zones: data.zones, preventSameClub: data.preventSameClub }
    case 5:
      return {
        freeDates: data.freeDates,
        interzonalDates: data.interzonalDates,
        fixtureGenerated: data.fixtureGenerated,
        preventClubClash: data.preventClubClash
      }
    default:
      return null
  }
}

/** Valores por defecto para limpiar los pasos posteriores a `step` */
function getDefaultsForStepsAfter(step: number): Partial<TournamentWizardData> {
  const base = {
    currentPhaseIndex: 0,
    teamCount: 16,
    selectedTeams: [] as TournamentWizardData['selectedTeams'],
    searchMode: 'name' as const,
    filterYear: '',
    filterType: '',
    filterTournament: '',
    filterPhase: '',
    filterZone: '',
    zones: [] as TournamentWizardData['zones'],
    zonesCount: 1,
    preventSameClub: false,
    freeDates: 0,
    interzonalDates: 0,
    fixtureGenerated: false,
    preventClubClash: false
  }
  if (step <= 1) return { ...base, phases: [] }
  if (step <= 2) return base
  if (step <= 3)
    return {
      zones: base.zones,
      zonesCount: base.zonesCount,
      preventSameClub: base.preventSameClub,
      freeDates: base.freeDates,
      interzonalDates: base.interzonalDates,
      fixtureGenerated: base.fixtureGenerated,
      preventClubClash: base.preventClubClash
    }
  if (step <= 4)
    return {
      freeDates: base.freeDates,
      interzonalDates: base.interzonalDates,
      fixtureGenerated: base.fixtureGenerated,
      preventClubClash: base.preventClubClash
    }
  return {}
}

export default function CrearTorneoWizard() {
  const navigate = useNavigate()
  const [confirmacionLimpiarAbierta, setConfirmacionLimpiarAbierta] =
    useState(false)
  const pendienteAccionRef = useRef<
    { tipo: 'next' } | { tipo: 'step'; targetStep: number } | null
  >(null)

  const {
    currentStep,
    maxStepReached,
    nextStep,
    prevStep,
    goToStep,
    editingFromSummaryStep,
    setEditingFromSummaryStep
  } = useWizardStore()

  const stepSnapshotRef = useRef<unknown>(null)

  const methods = useForm<TournamentWizardData>({
    defaultValues: initialData,
    mode: 'onChange',
    resolver: zodResolver(tournamentWizardSchema)
  })

  const mutation = useApiMutation({
    fn: async (nuevoTorneo: TorneoDTO) => {
      await api.torneoPOST(nuevoTorneo)
    },
    antesDeMensajeExito: () => navigate(rutasNavegacion.torneos),
    mensajeDeExito: 'Torneo creado correctamente'
  })

  // Validar el paso actual antes de avanzar
  const validateCurrentStep = async () => {
    const formData = methods.getValues()

    try {
      switch (currentStep) {
        case 1:
          await step1Schema.parseAsync({
            name: formData.name,
            season: formData.season,
            type: formData.type,
            categories: formData.categories,
            format: formData.format
          })
          break

        case 2:
          await step2Schema.parseAsync({
            phases: formData.phases
          })
          break

        case 3:
          await step3Schema.parseAsync({
            teamCount: formData.teamCount,
            selectedTeams: formData.selectedTeams
          })
          break

        case 4:
          await step4Schema.parseAsync({
            zones: formData.zones,
            selectedTeams: formData.selectedTeams
          })
          break

        case 5:
          await step5Schema.parseAsync({
            fixtureGenerated: formData.fixtureGenerated
          })
          break
      }
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const mensajes = [
          ...new Set(error.issues.map((issue) => issue.message))
        ]
        toast.error(
          mensajes.length === 1 ? (
            mensajes[0]
          ) : (
            <span className='block'>
              {mensajes.map((msg, i) => (
                <span key={i} className='block'>
                  • {msg}
                </span>
              ))}
            </span>
          )
        )
      } else {
        toast.error('Por favor, completa todos los campos requeridos')
      }
      return false
    }
  }

  const onEditStep = (step: number) => {
    const formData = methods.getValues()
    stepSnapshotRef.current = getStepData(formData, step)
    setEditingFromSummaryStep(step)
    goToStep(step)
  }

  const debeMostrarConfirmacionLimpiar = () => {
    if (
      editingFromSummaryStep === null ||
      editingFromSummaryStep !== currentStep
    )
      return false
    const formData = methods.getValues()
    const actual = getStepData(formData, currentStep)
    const snapshot = stepSnapshotRef.current
    return JSON.stringify(actual) !== JSON.stringify(snapshot)
  }

  const aplicarRevertirCambios = () => {
    const snapshot = stepSnapshotRef.current as Record<string, unknown>
    if (!snapshot) return
    const current = methods.getValues()
    const nuevosValores = { ...current }
    if (currentStep === 1) {
      Object.assign(nuevosValores, snapshot)
    } else if (currentStep === 2) {
      nuevosValores.phases = snapshot.phases as TournamentWizardData['phases']
    } else if (currentStep === 3) {
      Object.assign(nuevosValores, snapshot)
    } else if (currentStep === 4) {
      nuevosValores.zones = snapshot.zones as TournamentWizardData['zones']
      nuevosValores.preventSameClub = snapshot.preventSameClub as boolean
    } else if (currentStep === 5) {
      Object.assign(nuevosValores, snapshot)
    }
    methods.reset(nuevosValores)
    setEditingFromSummaryStep(null)
    stepSnapshotRef.current = null
  }

  const aplicarConfirmarYLimpiar = () => {
    const defaults = getDefaultsForStepsAfter(currentStep)
    const current = methods.getValues()
    methods.reset({ ...current, ...defaults })
    setEditingFromSummaryStep(null)
    stepSnapshotRef.current = null
  }

  const handleNext = async () => {
    const isValid = await validateCurrentStep()
    if (!isValid) return

    if (debeMostrarConfirmacionLimpiar()) {
      pendienteAccionRef.current = { tipo: 'next' }
      setConfirmacionLimpiarAbierta(true)
      return
    }
    nextStep()
  }

  const handlePrev = () => prevStep()

  const handleStepClick = async (targetStep: number) => {
    if (targetStep === currentStep) return
    if (targetStep < currentStep) {
      goToStep(targetStep)
      return
    }
    const isValid = await validateCurrentStep()
    if (!isValid) return
    if (targetStep > maxStepReached) {
      toast.error(
        'Completa el paso actual y avanza con "Siguiente" para desbloquear más pasos'
      )
      return
    }

    if (debeMostrarConfirmacionLimpiar()) {
      pendienteAccionRef.current = { tipo: 'step', targetStep }
      setConfirmacionLimpiarAbierta(true)
      return
    }
    goToStep(targetStep)
  }

  const handleRevertirCambios = () => {
    aplicarRevertirCambios()
    setConfirmacionLimpiarAbierta(false)
    pendienteAccionRef.current = null
  }

  const handleConfirmarYLimpiar = () => {
    aplicarConfirmarYLimpiar()
    setConfirmacionLimpiarAbierta(false)
    const pendiente = pendienteAccionRef.current
    pendienteAccionRef.current = null
    if (pendiente?.tipo === 'next') nextStep()
    else if (pendiente?.tipo === 'step') goToStep(pendiente.targetStep)
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
          <StepIndicator
            currentStep={currentStep}
            maxStepReached={maxStepReached}
            totalSteps={6}
            onStepClick={handleStepClick}
          />

          <div>
            {currentStep === 1 && <Step1Information />}
            {currentStep === 2 && <Step2Phases />}
            {currentStep === 3 && <Step3Teams />}
            {currentStep === 4 && <Step4Zones />}
            {currentStep === 5 && <Step5Fixture />}
            {currentStep === 6 && <Step6Summary onEditStep={onEditStep} />}
          </div>

          <AlertDialog
            open={confirmacionLimpiarAbierta}
            onOpenChange={(open) => {
              if (!open) pendienteAccionRef.current = null
              setConfirmacionLimpiarAbierta(open)
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cambios detectados</AlertDialogTitle>
                <AlertDialogDescription>
                  Realizaste cambios en este paso y por lo tanto todos los pasos
                  siguientes se limpiarán.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={handleRevertirCambios}>
                  Revertir cambios
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmarYLimpiar}>
                  Confirmar cambios y limpiar pasos siguientes
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className='flex justify-between pt-4 border-t'>
            {currentStep === 1 ? (
              <div />
            ) : (
              <Button
                type='button'
                className='h-11 w-28 text-sm'
                variant='outline'
                onClick={handlePrev}
              >
                Anterior
              </Button>
            )}

            {currentStep < 6 ? (
              <Button
                type='button'
                className='h-11 w-28 text-sm'
                onClick={handleNext}
              >
                Siguiente
              </Button>
            ) : (
              <Boton
                type='button'
                className='h-11 w-28 text-sm'
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

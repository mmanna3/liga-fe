import { create } from 'zustand'

interface WizardStore {
  currentStep: number
  maxStepReached: number
  /** Paso al que se navegó desde el resumen (6) para editar. null si no viene del resumen. */
  editingFromSummaryStep: number | null
  setCurrentStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  setEditingFromSummaryStep: (step: number | null) => void
  resetWizard: () => void
}

export const useWizardStore = create<WizardStore>((set, get) => ({
  currentStep: 1,
  maxStepReached: 1,
  editingFromSummaryStep: null,

  setCurrentStep: (step: number) => {
    set({ currentStep: step })
  },

  nextStep: () => {
    const { currentStep, maxStepReached } = get()
    if (currentStep >= 6) return
    const nextStepNumber = currentStep + 1
    set({
      currentStep: nextStepNumber,
      maxStepReached: Math.max(maxStepReached, nextStepNumber)
    })
  },

  prevStep: () => {
    const current = get().currentStep
    if (current > 1) {
      set({ currentStep: current - 1 })
    }
  },

  goToStep: (step: number) => {
    set({ currentStep: step })
  },

  setEditingFromSummaryStep: (step: number | null) => {
    set({ editingFromSummaryStep: step })
  },

  resetWizard: () => {
    set({ currentStep: 1, maxStepReached: 1, editingFromSummaryStep: null })
  }
}))

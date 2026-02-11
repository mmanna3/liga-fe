import { create } from 'zustand'

interface WizardStore {
  currentStep: number
  maxStepReached: number
  setCurrentStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  resetWizard: () => void
}

export const useWizardStore = create<WizardStore>((set, get) => ({
  currentStep: 1,
  maxStepReached: 1,

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

  resetWizard: () => {
    set({ currentStep: 1, maxStepReached: 1 })
  }
}))

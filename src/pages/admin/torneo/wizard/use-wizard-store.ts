import { create } from 'zustand'

interface WizardStore {
  currentStep: number
  setCurrentStep: (step: number) => void
  nextStep: (zonesCount: number) => void
  prevStep: (zonesCount: number) => void
  goToStep: (step: number) => void
  resetWizard: () => void
}

export const useWizardStore = create<WizardStore>((set, get) => ({
  currentStep: 1,

  setCurrentStep: (step: number) => {
    set({ currentStep: step })
  },

  nextStep: (zonesCount: number) => {
    const current = get().currentStep
    if (current === 3 && zonesCount === 1) {
      set({ currentStep: 5 })
    } else if (current < 6) {
      set({ currentStep: current + 1 })
    }
  },

  prevStep: (zonesCount: number) => {
    const current = get().currentStep
    if (current === 5 && zonesCount === 1) {
      set({ currentStep: 3 })
    } else if (current > 1) {
      set({ currentStep: current - 1 })
    }
  },

  goToStep: (step: number) => {
    set({ currentStep: step })
  },

  resetWizard: () => {
    set({ currentStep: 1 })
  }
}))

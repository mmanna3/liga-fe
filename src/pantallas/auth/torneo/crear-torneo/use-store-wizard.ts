import { create } from 'zustand'

interface StoreWizard {
  pasoActual: number
  maxPasoAlcanzado: number
  /** Paso al que se navegó desde el resumen (6) para editar. null si no viene del resumen. */
  editandoDesdePasoResumen: number | null
  setPasoActual: (paso: number) => void
  siguientePaso: () => void
  pasoAnterior: () => void
  irAlPaso: (paso: number) => void
  setEditandoDesdePasoResumen: (paso: number | null) => void
  reiniciarWizard: () => void
}

export const useStoreWizard = create<StoreWizard>((set, get) => ({
  pasoActual: 1,
  maxPasoAlcanzado: 1,
  editandoDesdePasoResumen: null,

  setPasoActual: (paso: number) => {
    set({ pasoActual: paso })
  },

  siguientePaso: () => {
    const { pasoActual, maxPasoAlcanzado } = get()
    if (pasoActual >= 6) return
    const siguientePasoNumero = pasoActual + 1
    set({
      pasoActual: siguientePasoNumero,
      maxPasoAlcanzado: Math.max(maxPasoAlcanzado, siguientePasoNumero)
    })
  },

  pasoAnterior: () => {
    const actual = get().pasoActual
    if (actual > 1) {
      set({ pasoActual: actual - 1 })
    }
  },

  irAlPaso: (paso: number) => {
    set({ pasoActual: paso })
  },

  setEditandoDesdePasoResumen: (paso: number | null) => {
    set({ editandoDesdePasoResumen: paso })
  },

  reiniciarWizard: () => {
    set({ pasoActual: 1, maxPasoAlcanzado: 1, editandoDesdePasoResumen: null })
  }
}))

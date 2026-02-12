import { useEffect, useState } from 'react'

export type PaletaId = 'negro' | 'azul' | 'verde' | 'rojo'

const primarios: Record<PaletaId, string> = {
  negro: '',
  azul: 'oklch(0.488 0.243 264.376)',
  verde: 'oklch(0.517 0.176 142.495)',
  rojo: 'oklch(0.535 0.22 25)',
}

const STORAGE_KEY = 'paleta-colores'

function aplicarPaleta(id: PaletaId) {
  if (id === 'negro') {
    document.documentElement.style.removeProperty('--primary')
  } else {
    document.documentElement.style.setProperty('--primary', primarios[id])
  }
}

export function usePaletaColores() {
  const [paleta, setPaletaState] = useState<PaletaId>(() => {
    return (localStorage.getItem(STORAGE_KEY) as PaletaId) || 'verde'
  })

  useEffect(() => {
    aplicarPaleta(paleta)
  }, [paleta])

  const setPaleta = (id: PaletaId) => {
    localStorage.setItem(STORAGE_KEY, id)
    setPaletaState(id)
  }

  return { paleta, setPaleta }
}

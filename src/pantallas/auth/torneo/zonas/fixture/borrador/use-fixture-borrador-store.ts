import { create } from 'zustand'
import type { ItemFixture } from '../tipos'
import {
  dateDesdePrimeraFechaIso,
  primeraFechaIsoDesdeDate
} from './fixture-borrador-logica'

export type FixtureBorradorPorZona = {
  hashEquipos: string
  listaOrdenada: ItemFixture[]
  primeraFechaIso: string
  algoritmoIdSeleccionado: string | null
  listaFijada: ItemFixture[] | null
}

type Patch = Partial<
  Pick<
    FixtureBorradorPorZona,
    | 'listaOrdenada'
    | 'primeraFechaIso'
    | 'algoritmoIdSeleccionado'
    | 'listaFijada'
  >
>

type Estado = {
  porZona: Record<number, FixtureBorradorPorZona>
  patch: (zonaId: number, hashEquipos: string, partial: Patch) => void
  limpiarBorrador: (zonaId: number) => void
  resetParaTests: () => void
}

function borradorVacio(hashEquipos: string): FixtureBorradorPorZona {
  return {
    hashEquipos,
    listaOrdenada: [],
    primeraFechaIso: primeraFechaIsoDesdeDate(new Date()),
    algoritmoIdSeleccionado: null,
    listaFijada: null
  }
}

function mergeBorrador(
  prev: FixtureBorradorPorZona | undefined,
  hashEquipos: string,
  partial: Patch
): FixtureBorradorPorZona {
  const mismoHash = prev != null && prev.hashEquipos === hashEquipos
  const base: FixtureBorradorPorZona = mismoHash
    ? prev
    : borradorVacio(hashEquipos)
  return {
    ...base,
    ...partial,
    hashEquipos
  }
}

export const useFixtureBorradorStore = create<Estado>((set) => ({
  porZona: {},
  patch: (zonaId, hashEquipos, partial) => {
    set((s) => {
      const prev = s.porZona[zonaId]
      const merged = mergeBorrador(prev, hashEquipos, partial)
      return { porZona: { ...s.porZona, [zonaId]: merged } }
    })
  },
  limpiarBorrador: (zonaId) => {
    set((s) => {
      const rest = { ...s.porZona }
      delete rest[zonaId]
      return { porZona: rest }
    })
  },
  resetParaTests: () => set({ porZona: {} })
}))

export function obtenerPrimeraFechaDesdeBorrador(
  zonaId: number,
  hashEquipos: string
): Date | null {
  const b = useFixtureBorradorStore.getState().porZona[zonaId]
  if (b?.hashEquipos !== hashEquipos || !b.primeraFechaIso) return null
  return dateDesdePrimeraFechaIso(b.primeraFechaIso)
}

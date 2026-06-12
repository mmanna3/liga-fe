import type { FaseEstado } from '../../../lib'

export interface GrupoDeFasesEstado {
  id?: number
  idLocal: string
  numero: number
  nombre: string
  grupoDeFasesPadreId?: number | null
  elementos: ElementoEstructuraTorneo[]
}

export type ElementoEstructuraTorneo =
  | { tipo: 'fase'; fase: FaseEstado }
  | { tipo: 'grupo'; grupo: GrupoDeFasesEstado }

export const PROFUNDIDAD_MAX_GRUPO = 2

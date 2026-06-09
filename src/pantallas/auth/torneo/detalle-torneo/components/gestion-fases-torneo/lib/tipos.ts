import type { FaseEstado } from '../../../lib'

export interface GrupoDeFasesEstado {
  id?: number
  idLocal: string
  numero: number
  nombre: string
  fases: FaseEstado[]
}

export type ElementoEstructuraTorneo =
  | { tipo: 'fase'; fase: FaseEstado }
  | { tipo: 'grupo'; grupo: GrupoDeFasesEstado }

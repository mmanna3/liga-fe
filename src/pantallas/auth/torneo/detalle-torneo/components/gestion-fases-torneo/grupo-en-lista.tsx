import { cn } from '@/logica-compartida/utils'
import type { FaseDTO, TorneoCategoriaDTO } from '@/api/clients'
import { GrupoDeFasesItem } from './grupo-de-fases-item'
import type { GrupoDeFasesEstado } from './lib/tipos'
import type { GrupoDeFasesCallbacks } from './grupo-de-fases-item'

interface GrupoEnListaProps extends GrupoDeFasesCallbacks {
  grupo: GrupoDeFasesEstado
  torneoId: number
  nombreTorneo: string
  torneoFases: FaseDTO[]
  categoriasTorneo: TorneoCategoriaDTO[]
  estaGuardando: boolean
}

export function GrupoEnLista({
  grupo,
  torneoId,
  nombreTorneo,
  torneoFases,
  categoriasTorneo,
  onActualizarGrupo,
  onActualizarFase,
  onEliminarFase,
  onEliminarGrupo,
  onAgregarSubgrupo,
  onIrAZonas,
  estaGuardando
}: GrupoEnListaProps) {
  return (
    <div className={cn('col-span-full')}>
      <GrupoDeFasesItem
        grupo={grupo}
        profundidad={1}
        torneoId={torneoId}
        nombreTorneo={nombreTorneo}
        torneoFases={torneoFases}
        categoriasTorneo={categoriasTorneo}
        onActualizarGrupo={onActualizarGrupo}
        onActualizarFase={onActualizarFase}
        onEliminarFase={onEliminarFase}
        onEliminarGrupo={onEliminarGrupo}
        onAgregarSubgrupo={onAgregarSubgrupo}
        onIrAZonas={onIrAZonas}
        estaGuardando={estaGuardando}
        sortable
      />
    </div>
  )
}

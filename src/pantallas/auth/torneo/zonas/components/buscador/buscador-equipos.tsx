import { EquipoDTO } from '@/api/clients'
import { Boton } from '@/design-system/ykn-ui/boton'
import CajitaConTick from '@/design-system/ykn-ui/cajita-con-tick'
import { Input } from '@/design-system/ykn-ui/input'
import SelectorSimple from '@/design-system/ykn-ui/selector-simple'
import { useMemo, useState } from 'react'
import {
  ElegirZonaBuscadorEquipos,
  type ZonaVisibleParaModal
} from './elegir-zona-buscador-equipos'
import { FiltrosBuscadorDeEquipos } from './filtros-buscador'
import { useBuscadorEquipos } from './hooks/use-buscador-equipos'
import { RenglonBuscadorDeEquipos } from './renglon-equipo'

interface BuscadorDeEquiposParaZonaProps {
  equiposEnZonas: EquipoDTO[]
  zonasVisibles: ZonaVisibleParaModal[]
  onAgregarSeleccionadosAZona: (
    indiceZona: number,
    equipos: EquipoDTO[]
  ) => void
}

export function BuscadorDeEquiposParaZona({
  equiposEnZonas,
  zonasVisibles,
  onAgregarSeleccionadosAZona
}: BuscadorDeEquiposParaZonaProps) {
  const [modalZonaAbierto, setModalZonaAbierto] = useState(false)

  const {
    modo,
    setModo,
    textoBusqueda,
    setTextoBusqueda,
    seleccionMultipleActiva,
    idsSeleccionados,
    filtroAnio,
    setFiltroAnio,
    filtroAgrupadorId,
    setFiltroAgrupadorId,
    filtroTorneoId,
    setFiltroTorneoId,
    filtroFaseId,
    setFiltroFaseId,
    filtroZonaId,
    setFiltroZonaId,
    equiposFiltrados,
    opcionesModo,
    toggleSeleccion,
    handleSeleccionVariosChange,
    handleDragStart
  } = useBuscadorEquipos({ equiposEnZonas })

  const equiposSeleccionados = useMemo(
    () =>
      equiposFiltrados.filter(
        (eq) => eq.id != null && idsSeleccionados.has(eq.id)
      ),
    [equiposFiltrados, idsSeleccionados]
  )

  const elegirZonaYAgregar = (indiceZona: number) => {
    if (equiposSeleccionados.length === 0) return
    onAgregarSeleccionadosAZona(indiceZona, equiposSeleccionados)
    setModalZonaAbierto(false)
  }

  return (
    <div className='space-y-4'>
      <SelectorSimple
        opciones={opcionesModo}
        valorActual={modo}
        alElegirOpcion={setModo}
      />

      {modo === 'buscar' && (
        <Input
          tipo='text'
          value={textoBusqueda}
          onChange={(e) => setTextoBusqueda(e.target.value)}
          placeholder='Código, nombre o club'
        />
      )}

      {modo === 'otro-torneo' && (
        <FiltrosBuscadorDeEquipos
          filtroAnio={filtroAnio}
          onFiltroAnioChange={setFiltroAnio}
          filtroAgrupadorId={filtroAgrupadorId}
          onFiltroAgrupadorIdChange={setFiltroAgrupadorId}
          filtroTorneoId={filtroTorneoId}
          onFiltroTorneoIdChange={setFiltroTorneoId}
          filtroFaseId={filtroFaseId}
          onFiltroFaseIdChange={setFiltroFaseId}
          filtroZonaId={filtroZonaId}
          onFiltroZonaIdChange={setFiltroZonaId}
        />
      )}

      <div className='mb-2 flex flex-wrap items-center justify-end gap-3'>
        <Boton
          type='button'
          variant='outline'
          size='sm'
          disabled={equiposSeleccionados.length === 0}
          onClick={() => setModalZonaAbierto(true)}
        >
          Agregar seleccionados a la zona
        </Boton>
        <CajitaConTick
          id='seleccion-varios'
          checked={seleccionMultipleActiva}
          onCheckedChange={handleSeleccionVariosChange}
          label='Seleccionar varios'
        />

        <ElegirZonaBuscadorEquipos
          open={modalZonaAbierto}
          onOpenChange={setModalZonaAbierto}
          zonasVisibles={zonasVisibles}
          onElegirZona={elegirZonaYAgregar}
        />
      </div>

      <div>
        <div className='space-y-2 max-h-64 overflow-y-auto'>
          {equiposFiltrados.map((eq) => (
            <RenglonBuscadorDeEquipos
              key={eq.id}
              equipo={eq}
              seleccionMultipleActiva={seleccionMultipleActiva}
              idsSeleccionados={idsSeleccionados}
              onToggleSeleccion={toggleSeleccion}
              onDragStart={handleDragStart}
            />
          ))}
          {equiposFiltrados.length === 0 && (
            <p className='text-sm text-muted-foreground py-4 text-center'>
              No hay equipos disponibles
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

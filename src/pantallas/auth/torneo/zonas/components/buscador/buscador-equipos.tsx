import { EquipoDTO } from '@/api/clients'
import CajitaConTick from '@/design-system/ykn-ui/cajita-con-tick'
import { Input } from '@/design-system/ykn-ui/input'
import SelectorSimple from '@/design-system/ykn-ui/selector-simple'
import { FiltrosBuscadorDeEquipos } from './filtros-buscador'
import { useBuscadorEquipos } from './hooks/use-buscador-equipos'
import { RenglonBuscadorDeEquipos } from './renglon-equipo'

interface BuscadorDeEquiposParaZonaProps {
  equiposEnZonas: EquipoDTO[]
}

export function BuscadorDeEquiposParaZona({
  equiposEnZonas
}: BuscadorDeEquiposParaZonaProps) {
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

      <div className='mb-2 flex justify-end'>
        <CajitaConTick
          id='seleccion-varios'
          checked={seleccionMultipleActiva}
          onCheckedChange={handleSeleccionVariosChange}
          label='Seleccionar varios'
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

import { EquipoDTO } from '@/api/clients'
import { Boton } from '@/design-system/ykn-ui/boton'
import Icono from '@/design-system/ykn-ui/icono'
import CajitaConTick from '@/design-system/ykn-ui/cajita-con-tick'
import { Input } from '@/design-system/ykn-ui/input'
import SelectorSimple from '@/design-system/ykn-ui/selector-simple'
import { useMemo, useState } from 'react'
import { FiltrosBuscadorDeEquipos } from './filtros-buscador'
import { useBuscadorEquipos } from './hooks/use-buscador-equipos'
import {
  ModalElegirZonaBuscadorEquipos,
  type ZonaVisibleParaModal
} from './modal-elegir-zona-buscador-equipos'
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
    catalogoEquiposDisponibles,
    opcionesModo,
    toggleSeleccion,
    handleSeleccionVariosChange,
    limpiarSeleccion,
    handleDragStart
  } = useBuscadorEquipos({ equiposEnZonas })

  const equiposSeleccionados = useMemo(
    () =>
      catalogoEquiposDisponibles.filter(
        (eq) => eq.id != null && idsSeleccionados.has(eq.id)
      ),
    [catalogoEquiposDisponibles, idsSeleccionados]
  )

  const cantidadSeleccionados = equiposSeleccionados.length
  const textoCantidadSeleccionados =
    cantidadSeleccionados === 0
      ? ''
      : cantidadSeleccionados === 1
        ? '1 equipo seleccionado'
        : `${cantidadSeleccionados} equipos seleccionados`

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

      <div className='mb-2 flex flex-wrap items-center justify-between gap-3'>
        <span className='text-sm text-foreground min-w-0'>
          {textoCantidadSeleccionados}
        </span>
        <div className='flex flex-wrap items-center gap-3'>
          <div className='flex flex-wrap items-center gap-2'>
            <Boton
              type='button'
              variant='outline'
              size='sm'
              disabled={cantidadSeleccionados === 0}
              onClick={limpiarSeleccion}
              className='gap-1.5'
            >
              <Icono nombre='limpiar' className='size-4' />
              Limpiar selección
            </Boton>
            <Boton
              type='button'
              variant='outline'
              size='sm'
              disabled={cantidadSeleccionados === 0}
              onClick={() => setModalZonaAbierto(true)}
            >
              Agregar seleccionados a la zona
            </Boton>
          </div>
          <CajitaConTick
            id='seleccion-varios'
            checked={seleccionMultipleActiva}
            onCheckedChange={handleSeleccionVariosChange}
            label='Seleccionar varios'
          />
        </div>

        <ModalElegirZonaBuscadorEquipos
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

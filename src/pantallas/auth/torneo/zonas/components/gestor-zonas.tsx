import { api } from '@/api/api'
import { EquipoDTO, TipoDeFaseEnum } from '@/api/clients'
import useApiQuery from '@/api/hooks/use-api-query'
import { Boton } from '@/design-system/ykn-ui/boton'
import LayoutSegundoNivel from '@/design-system/ykn-ui/layout-segundo-nivel'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { BuscadorDeEquiposParaZona } from './buscador/buscador-equipos'
import { useGuardarZonas } from '../hooks/use-guardar-zonas'
import { useZonasEstado } from '../hooks/use-zonas'
import { zonaDtoAEstado } from './tipos'
import { ContenidoZonasEditable } from './zonas-grid'

interface GestorZonasProps {
  modo: 'crear' | 'modificar'
  headerCard?: React.ReactNode
  pathVolver: string
}

export function GestorZonas({
  modo,
  headerCard,
  pathVolver
}: GestorZonasProps) {
  const { id: torneoIdParam, faseId: faseIdParam } = useParams<{
    id: string
    faseId: string
  }>()
  const torneoId = Number(torneoIdParam)
  const faseId = Number(faseIdParam)

  const { data: torneo } = useApiQuery({
    key: ['torneo', torneoId],
    fn: () => api.torneoGET(torneoId),
    activado: Number.isFinite(torneoId)
  })

  const fase = useMemo(
    () => torneo?.fases?.find((f) => f.id === faseId),
    [torneo, faseId]
  )
  const nombreZonaEditable = fase?.tipoDeFase !== TipoDeFaseEnum._2

  const { data: zonasApi = [], refetch } = useApiQuery({
    key: ['zonasAll', faseId],
    fn: () => api.zonasAll(faseId),
    activado: modo === 'modificar'
  })

  const {
    zonasEstado,
    setZonasEstado,
    equiposEnZonas,
    actualizarZona,
    agregarEquipoAZona,
    quitarEquipoDeZona,
    eliminarZona,
    agregarZona
  } = useZonasEstado(
    modo === 'crear' ? [{ nombre: 'Zona A', equipos: [] }] : []
  )

  // Solo sincronizar desde la API en la carga inicial.
  // Un refetch en background (ej: window focus) NO debe pisar los cambios del usuario.
  const yaInicializado = useRef(false)
  useEffect(() => {
    if (
      modo === 'modificar' &&
      zonasApi.length > 0 &&
      !yaInicializado.current
    ) {
      setZonasEstado(zonasApi.map(zonaDtoAEstado))
      yaInicializado.current = true
    }
  }, [zonasApi, setZonasEstado, modo])

  const { guardarMutation, handleGuardar, handleIrAFixture } = useGuardarZonas({
    zonasEstado,
    modo,
    refetch
  })

  const agregarSeleccionadosAZona = useCallback(
    (indiceZona: number, equipos: EquipoDTO[]) => {
      for (const equipo of equipos) {
        agregarEquipoAZona(indiceZona, equipo)
      }
    },
    [agregarEquipoAZona]
  )

  const zonasParaElegirEnModal = zonasEstado.map((z, indice) => ({
    indice,
    nombre: z.nombre
  }))

  return (
    <LayoutSegundoNivel
      headerCard={headerCard}
      pathBotonVolver={pathVolver}
      maxWidth='6xl'
      contenido={
        <ContenidoZonasEditable
          zonasEstado={zonasEstado}
          onActualizarNombre={(i, n) => actualizarZona(i, 'nombre', n)}
          onQuitarEquipo={quitarEquipoDeZona}
          onDropEquipo={agregarEquipoAZona}
          onEliminarZona={eliminarZona}
          onAgregarZona={agregarZona}
          onIrAFixture={modo === 'modificar' ? handleIrAFixture : undefined}
          nombreZonaEditable={nombreZonaEditable}
          puedeEliminarZona={nombreZonaEditable}
        />
      }
      cardAdicional={
        <BuscadorDeEquiposParaZona
          equiposEnZonas={equiposEnZonas}
          zonasVisibles={zonasParaElegirEnModal}
          onAgregarSeleccionadosAZona={agregarSeleccionadosAZona}
        />
      }
      footer={
        <div className='flex justify-end pt-4 border-t mt-4'>
          <Boton
            type='button'
            onClick={handleGuardar}
            estaCargando={guardarMutation.isPending}
          >
            Guardar
          </Boton>
        </div>
      }
    />
  )
}

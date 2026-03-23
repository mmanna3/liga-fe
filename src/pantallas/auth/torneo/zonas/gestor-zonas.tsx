import { api } from '@/api/api'
import useApiQuery from '@/api/hooks/use-api-query'
import { Boton } from '@/design-system/ykn-ui/boton'
import LayoutSegundoNivel from '@/design-system/ykn-ui/layout-segundo-nivel'
import { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { BuscadorDeEquiposParaZona } from './components/buscador/buscador-equipos'
import { ContenidoZonasEditable } from './zonas-grid'
import { useGuardarZonas } from './hooks/use-guardar-zonas'
import { useZonasEstado } from './hooks/use-zonas'
import { zonaDtoAEstado } from './tipos'

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
  const { faseId: faseIdParam } = useParams<{
    id: string
    faseId: string
  }>()
  const faseId = Number(faseIdParam)

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

  return (
    <LayoutSegundoNivel
      headerCard={headerCard}
      cardAdicional={
        <BuscadorDeEquiposParaZona equiposEnZonas={equiposEnZonas} />
      }
      pathBotonVolver={pathVolver}
      maxWidth='6xl'
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
      contenido={
        <ContenidoZonasEditable
          zonasEstado={zonasEstado}
          onActualizarNombre={(i, n) => actualizarZona(i, 'nombre', n)}
          onQuitarEquipo={quitarEquipoDeZona}
          onDropEquipo={agregarEquipoAZona}
          onEliminarZona={eliminarZona}
          onAgregarZona={agregarZona}
          onIrAFixture={modo === 'modificar' ? handleIrAFixture : undefined}
        />
      }
    />
  )
}

import { api } from '@/api/api'
import { TorneoZonaDTO } from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import useApiQuery from '@/api/hooks/use-api-query'
import { Boton } from '@/design-system/ykn-ui/boton'
import LayoutSegundoNivel from '@/design-system/ykn-ui/layout-segundo-nivel'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useCallback, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BuscadorDeEquiposParaZona } from './buscador-de-equipos-para-zona'
import { ContenidoZonasEditable } from './contenido-zonas-editable'
import { useZonasEstado } from './use-zonas-estado'
import {
  validarZonasParaGuardar,
  zonaDtoAEstado,
  zonaEstadoADto
} from './tipos-zona'

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
  const navigate = useNavigate()
  const { id: torneoIdParam, faseId: faseIdParam } = useParams<{
    id: string
    faseId: string
  }>()
  const queryClient = useQueryClient()
  const torneoId = Number(torneoIdParam)
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

  // El body se pasa como argumento a mutate() para que siempre sea el estado actual,
  // independientemente de qué closure tenga useMutation internamente.
  const guardarMutation = useApiMutation<TorneoZonaDTO[]>({
    fn: async (body) => {
      if (modo === 'crear') {
        return await api.crearZonasMasivamente(faseId, body)
      } else {
        await api.modificarZonasMasivamente(faseId, body)
      }
    },
    mensajeDeExito:
      modo === 'crear'
        ? 'Zonas creadas correctamente'
        : 'Zonas actualizadas correctamente',
    antesDeMensajeExito: () => {
      if (modo === 'crear') {
        queryClient.invalidateQueries({ queryKey: ['zonasAll', faseId] })
      } else {
        refetch()
      }
      navigate(pathVolver)
    }
  })

  const handleGuardar = useCallback(() => {
    const validacion = validarZonasParaGuardar(zonasEstado)
    if (!validacion.valido) {
      toast.error(validacion.mensaje)
      return
    }
    const body = zonasEstado.map((z) => zonaEstadoADto(z, faseId))
    guardarMutation.mutate(body)
  }, [zonasEstado, faseId, guardarMutation])

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
          torneoId={torneoId}
          faseId={faseId}
          onActualizarNombre={(i, n) => actualizarZona(i, 'nombre', n)}
          onQuitarEquipo={quitarEquipoDeZona}
          onDropEquipo={agregarEquipoAZona}
          onEliminarZona={eliminarZona}
          onAgregarZona={agregarZona}
        />
      }
    />
  )
}

import { api } from '@/api/api'
import useApiMutation from '@/api/hooks/use-api-mutation'
import useApiQuery from '@/api/hooks/use-api-query'
import { Boton } from '@/design-system/ykn-ui/boton'
import LayoutSegundoNivel from '@/design-system/ykn-ui/layout-segundo-nivel'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useCallback, useEffect, useMemo } from 'react'
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

  useEffect(() => {
    if (modo === 'modificar' && zonasApi.length > 0) {
      setZonasEstado(zonasApi.map(zonaDtoAEstado))
    }
  }, [zonasApi, setZonasEstado, modo])

  const guardarMutation = useApiMutation<void>({
    fn: async () => {
      const body = zonasEstado.map((z) => zonaEstadoADto(z, faseId))
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

  const validacion = useMemo(
    () => validarZonasParaGuardar(zonasEstado),
    [zonasEstado]
  )

  const handleGuardar = useCallback(() => {
    if (!validacion.valido) {
      toast.error(validacion.mensaje)
      return
    }
    guardarMutation.mutate(undefined)
  }, [guardarMutation, validacion.valido, validacion.mensaje])

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

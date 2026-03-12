import { api } from '@/api/api'
import useApiMutation from '@/api/hooks/use-api-mutation'
import useApiQuery from '@/api/hooks/use-api-query'
import { Boton } from '@/design-system/ykn-ui/boton'
import LayoutSegundoNivel from '@/design-system/ykn-ui/layout-segundo-nivel'
import { useCallback, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ContenidoZonasEditable } from './contenido-zonas-editable'
import { useZonasEstado } from './use-zonas-estado'
import {
  validarZonasParaGuardar,
  zonaDtoAEstado,
  zonaEstadoADto
} from './tipos-zona'

interface ModificarZonasProps {
  titulo: string
  pathVolver: string
}

export function ModificarZonas({ titulo, pathVolver }: ModificarZonasProps) {
  const navigate = useNavigate()
  const { faseId: faseIdParam } = useParams<{ id: string; faseId: string }>()
  const faseId = Number(faseIdParam)

  const { data: zonasApi = [], refetch } = useApiQuery({
    key: ['zonasAll', faseId],
    fn: () => api.zonasAll(faseId)
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
  } = useZonasEstado([])

  useEffect(() => {
    if (zonasApi.length > 0) {
      setZonasEstado(zonasApi.map(zonaDtoAEstado))
    }
  }, [zonasApi, setZonasEstado])

  const guardarMutation = useApiMutation<void>({
    fn: async () => {
      const body = zonasEstado.map((z) => zonaEstadoADto(z, faseId))
      await api.modificarZonasMasivamente(faseId, body)
    },
    mensajeDeExito: 'Zonas actualizadas correctamente',
    antesDeMensajeExito: () => {
      refetch()
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
      titulo={titulo}
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
          equiposEnZonas={equiposEnZonas}
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

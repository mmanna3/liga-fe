import { api } from '@/api/api'
import useApiMutation from '@/api/hooks/use-api-mutation'
import { Boton } from '@/design-system/ykn-ui/boton'
import LayoutSegundoNivel from '@/design-system/ykn-ui/layout-segundo-nivel'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ContenidoZonasEditable } from './contenido-zonas-editable'
import { useZonasEstado } from './use-zonas-estado'
import { zonaEstadoADto } from './tipos-zona'

interface CrearZonasProps {
  titulo: string
  pathVolver: string
}

export function CrearZonas({ titulo, pathVolver }: CrearZonasProps) {
  const navigate = useNavigate()
  const { faseId: faseIdParam } = useParams<{ id: string; faseId: string }>()
  const queryClient = useQueryClient()
  const faseId = Number(faseIdParam)

  const {
    zonasEstado,
    equiposEnZonas,
    actualizarZona,
    agregarEquipoAZona,
    quitarEquipoDeZona,
    eliminarZona,
    agregarZona
  } = useZonasEstado([{ nombre: 'Zona A', equipos: [] }])

  const guardarMutation = useApiMutation<void>({
    fn: async () => {
      const body = zonasEstado.map((z) => zonaEstadoADto(z, faseId))
      return await api.crearZonasMasivamente(faseId, body)
    },
    mensajeDeExito: 'Zonas creadas correctamente',
    antesDeMensajeExito: () => {
      queryClient.invalidateQueries({ queryKey: ['zonasAll', faseId] })
      navigate(pathVolver)
    }
  })

  const handleGuardar = useCallback(() => {
    guardarMutation.mutate(undefined)
  }, [guardarMutation])

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

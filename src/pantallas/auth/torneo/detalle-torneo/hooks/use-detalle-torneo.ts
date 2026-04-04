import {
  CambiarVisibilidadTorneoEnAppDTO,
  TorneoCategoriaDTO,
  TorneoDTO
} from '@/api/clients'
import { api } from '@/api/api'
import useApiMutation from '@/api/hooks/use-api-mutation'
import useApiQuery from '@/api/hooks/use-api-query'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { categoriasACategoriaDto, categoriasDtoACategoria } from '../lib'
import type { Categoria } from '../../crear-torneo/tipos'

export function useDetalleTorneo() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const torneoId = Number(id)

  const {
    data: torneo,
    isLoading,
    isError,
    refetch
  } = useApiQuery({
    key: ['torneo', id],
    fn: async () => await api.torneoGET(torneoId)
  })

  const [editando, setEditando] = useState(false)
  const [nombre, setNombre] = useState('')
  const [temporada, setTemporada] = useState('')
  const [agrupadorId, setAgrupadorId] = useState<number | null>(null)
  const [categorias, setCategorias] = useState<Categoria[]>(
    categoriasDtoACategoria([])
  )

  useEffect(() => {
    if (!torneo) return
    setNombre(torneo.nombre ?? '')
    setTemporada(String(torneo.anio ?? ''))
    setAgrupadorId(torneo.torneoAgrupadorId ?? null)
    setCategorias(categoriasDtoACategoria(torneo.categorias ?? []))
  }, [torneo])

  const handleCancelarEdicion = () => {
    if (!torneo) return
    setNombre(torneo.nombre ?? '')
    setTemporada(String(torneo.anio ?? ''))
    setAgrupadorId(torneo.torneoAgrupadorId ?? null)
    setCategorias(categoriasDtoACategoria(torneo.categorias ?? []))
    setEditando(false)
  }

  const eliminarMutation = useApiMutation<void>({
    fn: async () => {
      await api.torneoDELETE(torneoId)
    },
    antesDeMensajeExito: () => navigate(rutasNavegacion.torneos),
    mensajeDeExito: `El torneo "${torneo?.nombre ?? ''}" fue eliminado.`
  })

  const guardarDatosBasicosMutation = useApiMutation<void>({
    fn: async () => {
      if (!torneo) return
      const body = new TorneoDTO({
        id: torneo.id,
        nombre,
        anio: parseInt(temporada, 10),
        torneoAgrupadorId: agrupadorId ?? undefined,
        categorias: categoriasACategoriaDto(categorias).map(
          (c) => new TorneoCategoriaDTO({ ...c, torneoId })
        ),
        fases: undefined,
        esVisibleEnApp: torneo.esVisibleEnApp
      })
      await api.torneoPUT(torneoId, body)
    },
    antesDeMensajeExito: () => {
      refetch()
      setEditando(false)
    },
    mensajeDeExito: 'Torneo actualizado correctamente'
  })

  const toggleVisibilidadAppMutation = useApiMutation<void>({
    fn: async () => {
      if (!torneo) return
      await api.torneoCambiarVisibilidadEnApp(
        torneoId,
        new CambiarVisibilidadTorneoEnAppDTO({
          esVisibleEnApp: !torneo.esVisibleEnApp
        })
      )
    },
    antesDeMensajeExito: () => refetch(),
    mensajeDeExito: 'Visibilidad en la app actualizada'
  })

  return {
    torneo,
    torneoId,
    id,
    isLoading,
    isError,
    refetch,
    editando,
    setEditando,
    nombre,
    setNombre,
    temporada,
    setTemporada,
    agrupadorId,
    setAgrupadorId,
    categorias,
    setCategorias,
    handleCancelarEdicion,
    eliminarMutation,
    guardarDatosBasicosMutation,
    toggleVisibilidadAppMutation
  }
}

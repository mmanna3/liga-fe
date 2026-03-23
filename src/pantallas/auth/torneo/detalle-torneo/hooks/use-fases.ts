import { TorneoCategoriaDTO, TorneoDTO, TorneoFaseDTO } from '@/api/clients'
import { api } from '@/api/api'
import useApiMutation from '@/api/hooks/use-api-mutation'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  categoriasACategoriaDto,
  categoriasDtoACategoria,
  formatoIdAOpción,
  type FaseEstado
} from '../lib'
import type { Categoria } from '../../crear-torneo/tipos'
import type { TorneoDTO as TorneoDTOType } from '@/api/clients'

interface UseFasesParams {
  torneo: TorneoDTOType | null | undefined
  torneoId: number
  id: string | undefined
  refetch: () => Promise<unknown>
  getDatosBasicos: () => {
    nombre: string
    temporada: string
    agrupadorId: number | null
    categorias: Categoria[]
  }
  setNombre: (n: string) => void
  setTemporada: (t: string) => void
  setAgrupadorId: (a: number | null) => void
  setCategorias: (c: Categoria[]) => void
  setEditando: (e: boolean) => void
}

export function useFases({
  torneo,
  torneoId,
  id,
  refetch,
  getDatosBasicos,
  setNombre,
  setTemporada,
  setAgrupadorId,
  setCategorias,
  setEditando
}: UseFasesParams) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const torneoFases = torneo?.fases ?? []

  const [fasesEstado, setFasesEstado] = useState<FaseEstado[]>([])

  useEffect(() => {
    if (!torneo) return
    setFasesEstado(
      (torneo.fases ?? []).map((f) => ({
        id: f.id,
        numero: f.numero ?? 0,
        nombre: f.nombre ?? '',
        formato: formatoIdAOpción(f.faseFormatoId),
        sePuedeEditar: f.sePuedeEditar !== false
      }))
    )
  }, [torneo])

  const actualizarFase = (index: number, campo: string, valor: string) => {
    setFasesEstado((prev) =>
      prev.map((f, i) => (i === index ? { ...f, [campo]: valor } : f))
    )
  }

  const eliminarFase = (index: number) => {
    setFasesEstado((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((f, i) => ({ ...f, numero: i + 1 }))
    )
  }

  const agregarFaseMutation = useApiMutation<void>({
    fn: async () => {
      const maxNumero = Math.max(0, ...fasesEstado.map((f) => f.numero))
      await api.fasesPOST(
        torneoId,
        new TorneoFaseDTO({
          numero: maxNumero + 1,
          nombre: 'Nueva fase',
          faseFormatoId: 1,
          estadoFaseId: 100,
          esVisibleEnApp: true,
          torneoId
        })
      )
    },
    antesDeMensajeExito: () => refetch(),
    mensajeDeExito: 'Fase creada'
  })

  const guardarMutation = useApiMutation<void>({
    fn: async () => {
      if (!torneo) return
      const { nombre, temporada, agrupadorId, categorias } = getDatosBasicos()
      const fasesValidas = fasesEstado
        .filter((f) => f.nombre.trim() && f.formato)
        .map((f) => ({
          id: f.id,
          numero: f.numero,
          nombre: f.nombre.trim(),
          faseFormatoId: f.formato === 'todos-contra-todos' ? 1 : 2,
          estadoFaseId: 100,
          esVisibleEnApp: true
        }))

      const body = new TorneoDTO({
        id: torneo.id,
        nombre,
        anio: parseInt(temporada, 10),
        torneoAgrupadorId: agrupadorId ?? undefined,
        categorias: categoriasACategoriaDto(categorias).map(
          (c) => new TorneoCategoriaDTO({ ...c, torneoId })
        ),
        fases: fasesValidas.map((f) => new TorneoFaseDTO({ ...f, torneoId }))
      })
      await api.torneoPUT(torneoId, body)
    },
    antesDeMensajeExito: () => refetch(),
    mensajeDeExito: 'Torneo actualizado correctamente'
  })

  const handleCancelarEdicion = () => {
    if (!torneo) return
    setNombre(torneo.nombre ?? '')
    setTemporada(String(torneo.anio ?? ''))
    setAgrupadorId(torneo.torneoAgrupadorId ?? null)
    setCategorias(categoriasDtoACategoria(torneo.categorias ?? []))
    setFasesEstado(
      (torneo.fases ?? []).map((f) => ({
        id: f.id,
        numero: f.numero ?? 0,
        nombre: f.nombre ?? '',
        formato: formatoIdAOpción(f.faseFormatoId),
        sePuedeEditar: f.sePuedeEditar !== false
      }))
    )
    setEditando(false)
  }

  const irAZonas = async (faseIndex: number) => {
    const faseEnEstado = fasesEstado[faseIndex]
    if (!faseEnEstado) return

    const faseTieneId = faseEnEstado.id != null && faseEnEstado.id > 0

    if (!faseTieneId) {
      await guardarMutation.mutateAsync(undefined)
      const torneoActualizado = await queryClient.fetchQuery({
        queryKey: ['torneo', id],
        queryFn: () => api.torneoGET(torneoId)
      })
      const faseActualizada = torneoActualizado?.fases?.find(
        (f: { numero?: number }) => f.numero === faseEnEstado.numero
      )
      if (!faseActualizada?.id) return
      navigate(
        `${rutasNavegacion.detalleTorneo}/${torneoId}/fases/${faseActualizada.id}/zonas`
      )
      return
    }

    navigate(
      `${rutasNavegacion.detalleTorneo}/${torneoId}/fases/${faseEnEstado.id}/zonas`
    )
  }

  return {
    torneoFases,
    fasesEstado,
    actualizarFase,
    eliminarFase,
    agregarFaseMutation,
    guardarMutation,
    irAZonas,
    handleCancelarEdicion
  }
}

import {
  TorneoCategoriaDTO,
  TorneoDTO,
  FaseDTO,
  TipoDeFaseEnum,
  ZonaDTO
} from '@/api/clients'
import { api } from '@/api/api'
import useApiMutation from '@/api/hooks/use-api-mutation'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import {
  categoriasACategoriaDto,
  categoriasDtoACategoria,
  type FaseEstado
} from '../../../lib'
import type { Categoria } from '../../../../crear-torneo/tipos'
import type { TorneoDTO as TorneoDTOType } from '@/api/clients'
import type { ElementoEstructuraTorneo } from '../lib/tipos'
import {
  actualizarFaseEnElementos,
  actualizarNombreGrupo,
  contarFases,
  crearGrupoVacio,
  eliminarFaseDeElementos,
  eliminarGrupoDevolviendoFases,
  idDragFaseEnGrupo,
  idDragGrupoDrop,
  moverFaseTopLevelAGrupo,
  parseFaseIdDesdeTopLevelDragId,
  parseGrupoIdLocalDesdeDropId,
  parseGrupoIdLocalDesdeFaseGrupoId,
  PREFIJO_DRAG_FASE_GRUPO,
  reordenarFasesEnGrupo,
  renumerarElementosTopLevel,
  torneoFasesAElementos
} from '../lib/estructura-utils'

interface UseEstructuraFasesParams {
  torneo: TorneoDTOType | null | undefined
  torneoId: number
  id: string | undefined
  refetch: () => Promise<unknown>
  getDatosBasicos: () => {
    nombre: string
    temporada: string
    agrupadorId: number | null
    categorias: Categoria[]
    seVenLosGolesEnTablaDePosiciones: boolean
  }
  setNombre: (n: string) => void
  setTemporada: (t: string) => void
  setAgrupadorId: (a: number | null) => void
  setCategorias: (c: Categoria[]) => void
  setSeVenLosGolesEnTablaDePosiciones: (v: boolean) => void
  setEditando: (e: boolean) => void
}

export function useEstructuraFases({
  torneo,
  torneoId,
  id,
  refetch,
  getDatosBasicos,
  setNombre,
  setTemporada,
  setAgrupadorId,
  setCategorias,
  setSeVenLosGolesEnTablaDePosiciones,
  setEditando
}: UseEstructuraFasesParams) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const torneoFases = torneo?.fases ?? []

  const [elementos, setElementos] = useState<ElementoEstructuraTorneo[]>([])
  const [creandoZonasEliminacion, setCreandoZonasEliminacion] = useState(false)

  // Grupos y asignación fase↔grupo son estado local hasta que exista el backend.
  useEffect(() => {
    if (!torneo) return
    setElementos(torneoFasesAElementos(torneo.fases ?? []))
  }, [torneo])

  const actualizarFaseTopLevel = (
    index: number,
    campo: string,
    valor: string
  ) => {
    setElementos((prev) =>
      actualizarFaseEnElementos(prev, { nivel: 'top', index }, campo, valor)
    )
  }

  const actualizarFaseEnGrupo = (
    grupoIndex: number,
    faseIndex: number,
    campo: string,
    valor: string
  ) => {
    setElementos((prev) =>
      actualizarFaseEnElementos(
        prev,
        { nivel: 'grupo', grupoIndex, faseIndex },
        campo,
        valor
      )
    )
  }

  const actualizarGrupo = (grupoIndex: number, nombre: string) => {
    setElementos((prev) => actualizarNombreGrupo(prev, grupoIndex, nombre))
  }

  const eliminarFaseMutation = useApiMutation<number>({
    fn: async (faseId) => {
      await api.fasesDELETE(torneoId, faseId)
    },
    antesDeMensajeExito: () => refetch(),
    mensajeDeExito: 'Fase eliminada'
  })

  const eliminarFaseTopLevel = (index: number) => {
    const el = elementos[index]
    if (el?.tipo !== 'fase') return
    const faseId = el.fase.id
    if (!faseId) return
    eliminarFaseMutation.mutate(faseId, {
      onSuccess: () => {
        setElementos((prev) =>
          eliminarFaseDeElementos(prev, { nivel: 'top', index })
        )
      }
    })
  }

  const eliminarFaseDeGrupo = (grupoIndex: number, faseIndex: number) => {
    const el = elementos[grupoIndex]
    if (el?.tipo !== 'grupo') return
    const faseId = el.grupo.fases[faseIndex]?.id
    if (!faseId) return
    eliminarFaseMutation.mutate(faseId, {
      onSuccess: () => {
        setElementos((prev) =>
          eliminarFaseDeElementos(prev, {
            nivel: 'grupo',
            grupoIndex,
            faseIndex
          })
        )
      }
    })
  }

  const agregarFaseMutation = useApiMutation<void>({
    fn: async () => {
      const maxNumero = Math.max(
        0,
        ...(torneo?.fases ?? []).map((f) => f.numero ?? 0)
      )
      await api.fasesPOST(
        torneoId,
        new FaseDTO({
          numero: maxNumero + 1,
          nombre: 'Nueva fase',
          tipoDeFase: TipoDeFaseEnum._1,
          estadoFaseId: 100,
          esVisibleEnApp: true,
          torneoId
        })
      )
    },
    antesDeMensajeExito: () => refetch(),
    mensajeDeExito: 'Fase creada'
  })

  const agregarGrupoDeFases = () => {
    setElementos((prev) =>
      renumerarElementosTopLevel([
        ...prev,
        { tipo: 'grupo', grupo: crearGrupoVacio() }
      ])
    )
  }

  const eliminarGrupo = (grupoIndex: number) => {
    const el = elementos[grupoIndex]
    if (el?.tipo !== 'grupo') return
    setElementos((prev) =>
      eliminarGrupoDevolviendoFases(prev, el.grupo.idLocal)
    )
  }

  const handleDragEnd = useCallback(
    (activeId: string, overId: string | null) => {
      if (!overId || activeId === overId) return

      const faseTopId = parseFaseIdDesdeTopLevelDragId(activeId)
      if (faseTopId != null) {
        const grupoIdLocal =
          parseGrupoIdLocalDesdeDropId(overId) ??
          parseGrupoIdLocalDesdeFaseGrupoId(overId)
        if (grupoIdLocal) {
          setElementos((prev) =>
            moverFaseTopLevelAGrupo(prev, faseTopId, grupoIdLocal)
          )
        }
        return
      }

      if (activeId.startsWith(PREFIJO_DRAG_FASE_GRUPO)) {
        const grupoIdLocal = parseGrupoIdLocalDesdeFaseGrupoId(activeId)
        if (!grupoIdLocal) return

        const overGrupoId =
          parseGrupoIdLocalDesdeFaseGrupoId(overId) ??
          parseGrupoIdLocalDesdeDropId(overId)
        if (overGrupoId !== grupoIdLocal) return

        setElementos((prev) => {
          const grupoEl = prev.find(
            (el) => el.tipo === 'grupo' && el.grupo.idLocal === grupoIdLocal
          )
          if (grupoEl?.tipo !== 'grupo') return prev

          const ids = grupoEl.grupo.fases.map((f, i) =>
            idDragFaseEnGrupo(grupoIdLocal, f, i)
          )
          const oldIndex = ids.indexOf(activeId)
          let newIndex = ids.indexOf(overId)
          if (newIndex < 0 && overId === idDragGrupoDrop(grupoIdLocal)) {
            newIndex = ids.length - 1
          }
          if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return prev
          return reordenarFasesEnGrupo(prev, grupoIdLocal, oldIndex, newIndex)
        })
      }
    },
    []
  )

  const guardarMutation = useApiMutation<void>({
    fn: async () => {
      if (!torneo) return
      const {
        nombre,
        temporada,
        agrupadorId,
        categorias,
        seVenLosGolesEnTablaDePosiciones
      } = getDatosBasicos()

      const todasLasFases: FaseEstado[] = []
      for (const el of elementos) {
        if (el.tipo === 'fase') {
          todasLasFases.push(el.fase)
        } else {
          todasLasFases.push(...el.grupo.fases)
        }
      }

      const fasesValidas = todasLasFases
        .filter((f) => f.nombre.trim() && f.formato)
        .map((f) => ({
          id: f.id,
          numero: f.numero,
          nombre: f.nombre.trim(),
          tipoDeFase:
            f.formato === 'todos-contra-todos'
              ? TipoDeFaseEnum._1
              : TipoDeFaseEnum._2,
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
        fases: fasesValidas.map((f) => new FaseDTO({ ...f, torneoId })),
        esVisibleEnApp: torneo.esVisibleEnApp,
        seVenLosGolesEnTablaDePosiciones
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
    setSeVenLosGolesEnTablaDePosiciones(
      torneo.seVenLosGolesEnTablaDePosiciones ?? true
    )
    setCategorias(categoriasDtoACategoria(torneo.categorias ?? []))
    setElementos(torneoFasesAElementos(torneo.fases ?? []))
    setEditando(false)
  }

  const asegurarZonasEliminacionDirecta = async (
    faseId: number,
    faseApi: FaseDTO | undefined,
    categoriasOverride?: TorneoCategoriaDTO[]
  ) => {
    if (faseApi?.tipoDeFase !== TipoDeFaseEnum._2) return

    const zonasExistentes = await api.zonasAll(faseId)
    if (zonasExistentes.length > 0) return

    const categorias = categoriasOverride ?? torneo?.categorias ?? []
    const categoriasConId = categorias.filter(
      (c): c is typeof c & { id: number } => c.id != null && c.id > 0
    )
    if (categoriasConId.length === 0) return

    const body = categoriasConId.map(
      (c, i) =>
        new ZonaDTO({
          categoriaId: c.id,
          categoriaNombre: '',
          nombre: c.nombre ?? '',
          faseId,
          orden: i + 1
        })
    )

    setCreandoZonasEliminacion(true)
    try {
      await api.crearZonasMasivamente(faseId, body)
      queryClient.invalidateQueries({ queryKey: ['torneo', id] })
      queryClient.invalidateQueries({ queryKey: ['zonasAll', faseId] })
    } catch (e) {
      console.error(e)
      toast.error('No se pudieron crear las zonas para la eliminación directa')
      throw e
    } finally {
      setCreandoZonasEliminacion(false)
    }
  }

  const irAZonas = async (faseId: number) => {
    if (creandoZonasEliminacion) return

    let faseEnEstado: FaseEstado | undefined
    for (const el of elementos) {
      if (el.tipo === 'fase' && el.fase.id === faseId) {
        faseEnEstado = el.fase
        break
      }
      if (el.tipo === 'grupo') {
        const f = el.grupo.fases.find((x) => x.id === faseId)
        if (f) {
          faseEnEstado = f
          break
        }
      }
    }
    if (!faseEnEstado) return

    const faseTieneId = faseEnEstado.id != null && faseEnEstado.id > 0

    if (!faseTieneId) {
      await guardarMutation.mutateAsync(undefined)
      const torneoActualizado = await queryClient.fetchQuery({
        queryKey: ['torneo', id],
        queryFn: () => api.torneoGET(torneoId)
      })
      const faseActualizada = torneoActualizado?.fases?.find(
        (f: { numero?: number }) => f.numero === faseEnEstado!.numero
      )
      if (!faseActualizada?.id) return
      try {
        await asegurarZonasEliminacionDirecta(
          faseActualizada.id,
          faseActualizada,
          torneoActualizado?.categorias
        )
      } catch {
        return
      }
      navigate(
        `${rutasNavegacion.detalleTorneo}/${torneoId}/fases/${faseActualizada.id}/zonas`
      )
      return
    }

    const faseApi = torneoFases.find((f) => f.id === faseId)
    try {
      await asegurarZonasEliminacionDirecta(faseId, faseApi)
    } catch {
      return
    }

    navigate(
      `${rutasNavegacion.detalleTorneo}/${torneoId}/fases/${faseId}/zonas`
    )
  }

  return {
    torneoFases,
    elementos,
    contarFases: () => contarFases(elementos),
    actualizarFaseTopLevel,
    actualizarFaseEnGrupo,
    actualizarGrupo,
    eliminarFaseTopLevel,
    eliminarFaseDeGrupo,
    eliminarGrupo,
    agregarFaseMutation,
    agregarGrupoDeFases,
    eliminarFaseMutation,
    guardarMutation,
    estaGuardandoZonas: guardarMutation.isPending || creandoZonasEliminacion,
    irAZonas,
    handleCancelarEdicion,
    handleDragEnd
  }
}

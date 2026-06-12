import {
  TorneoCategoriaDTO,
  TorneoDTO,
  FaseDTO,
  GrupoDeFasesDTO,
  TipoDeFaseEnum,
  ZonaDTO
} from '@/api/clients'
import { api } from '@/api/api'
import { estructuraFasesPUT } from '@/api/estructura-fases-api'
import {
  gruposDeFasesDELETE,
  gruposDeFasesPOST,
  gruposDeFasesPUT
} from '@/api/grupos-de-fases-api'
import useApiMutation from '@/api/hooks/use-api-mutation'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import {
  categoriasACategoriaDto,
  categoriasDtoACategoria,
  horarioParaInput
} from '../../../lib'
import type { Categoria } from '../../../../crear-torneo/tipos'
import type { ElementoEstructuraTorneo } from '../lib/tipos'
import {
  actualizarFaseEnElementos,
  actualizarNombreGrupo,
  buscarFaseEnElementos,
  contarFases,
  eliminarFaseDeElementos,
  eliminarGrupoDevolviendoFases,
  estructuraAItemsDto,
  encontrarGrupoPorIdLocal,
  encontrarPadreGrupoIdLocal,
  idDragFaseEnGrupo,
  idDragGrupoDrop,
  idTopLevelDesdeElemento,
  moverFaseEntreContenedores,
  moverFaseTopLevelAGrupo,
  parseFaseIdDesdeFaseGrupoDragId,
  parseFaseIdDesdeTopLevelDragId,
  parseGrupoIdLocalDesdeCualquierId,
  parseGrupoIdLocalDesdeFaseGrupoId,
  parseGrupoIdLocalDesdeTopLevelDragId,
  PREFIJO_DRAG_FASE_GRUPO,
  PREFIJO_DRAG_GRUPO_TOP,
  profundidadGrupo,
  reordenarElementosTopLevelPorIndices,
  reordenarEnGrupoPorIdLocal,
  todosLosIdsFasePresentes,
  torneoAElementos
} from '../lib/estructura-utils'

interface UseEstructuraFasesParams {
  torneo: TorneoDTO | null | undefined
  torneoId: number
  id: string | undefined
  refetch: () => Promise<unknown>
  getDatosBasicos: () => {
    nombre: string
    temporada: string
    agrupadorId: number | null
    categorias: Categoria[]
    seVenLosGolesEnTablaDePosiciones: boolean
    horarioDeJuego: string
  }
  setNombre: (n: string) => void
  setTemporada: (t: string) => void
  setAgrupadorId: (a: number | null) => void
  setCategorias: (c: Categoria[]) => void
  setSeVenLosGolesEnTablaDePosiciones: (v: boolean) => void
  setHorarioDeJuego: (h: string) => void
  setEditando: (e: boolean) => void
}

function torneoAElementosDesdeDto(torneo: TorneoDTO | null | undefined) {
  return torneoAElementos(torneo?.fases ?? [], torneo?.gruposDeFases ?? [])
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
  setHorarioDeJuego,
  setEditando
}: UseEstructuraFasesParams) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const torneoFases = torneo?.fases ?? []
  const torneoConGrupos = torneo

  const [elementos, setElementos] = useState<ElementoEstructuraTorneo[]>([])
  const [creandoZonasEliminacion, setCreandoZonasEliminacion] = useState(false)

  useEffect(() => {
    if (!torneo) return
    setElementos(torneoAElementosDesdeDto(torneoConGrupos))
  }, [torneo, torneoConGrupos])

  const persistirEstructuraMutation = useMutation({
    mutationFn: async (nuevosElementos: ElementoEstructuraTorneo[]) => {
      const items = estructuraAItemsDto(nuevosElementos)
      await estructuraFasesPUT(torneoId, items)
    },
    onSuccess: () => {
      void refetch()
    },
    onError: (error: unknown) => {
      console.error('Error al persistir estructura:', error)
      toast.error('No se pudo guardar la estructura de fases')
      void refetch()
    }
  })

  const persistirEstructura = useCallback(
    (nuevosElementos: ElementoEstructuraTorneo[]) => {
      const totalFases = torneo?.fases?.length ?? 0
      if (
        !todosLosIdsFasePresentes(nuevosElementos, totalFases) ||
        persistirEstructuraMutation.isPending
      ) {
        return
      }
      persistirEstructuraMutation.mutate(nuevosElementos)
    },
    [persistirEstructuraMutation, torneo?.fases?.length]
  )

  const actualizarFaseTopLevel = (
    index: number,
    campo: string,
    valor: string
  ) => {
    const el = elementos[index]
    if (el?.tipo !== 'fase' || el.fase.id == null) return
    setElementos((prev) =>
      actualizarFaseEnElementos(prev, el.fase.id!, campo, valor)
    )
  }

  const actualizarFaseEnGrupo = (
    faseId: number,
    campo: string,
    valor: string
  ) => {
    setElementos((prev) =>
      actualizarFaseEnElementos(prev, faseId, campo, valor)
    )
  }

  const actualizarGrupo = (grupoIdLocal: string, nombre: string) => {
    setElementos((prev) => actualizarNombreGrupo(prev, grupoIdLocal, nombre))
    const grupo = encontrarGrupoPorIdLocal(elementos, grupoIdLocal)
    if (grupo?.id) {
      void gruposDeFasesPUT(
        torneoId,
        grupo.id,
        new GrupoDeFasesDTO({
          id: grupo.id,
          nombre,
          numero: grupo.numero,
          torneoId,
          grupoDeFasesPadreId: grupo.grupoDeFasesPadreId ?? undefined
        })
      ).catch(() => toast.error('No se pudo guardar el nombre del grupo'))
    }
  }

  const eliminarFaseMutation = useApiMutation<number>({
    fn: async (faseId) => {
      await api.fasesDELETE(torneoId, faseId)
    },
    antesDeMensajeExito: () => refetch(),
    mensajeDeExito: 'Fase eliminada'
  })

  const eliminarFasePorId = (faseId: number) => {
    eliminarFaseMutation.mutate(faseId, {
      onSuccess: () => {
        setElementos((prev) => eliminarFaseDeElementos(prev, faseId))
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

  const agregarGrupoDeFases = (grupoPadreIdLocal?: string) => {
    const padre = grupoPadreIdLocal
      ? encontrarGrupoPorIdLocal(elementos, grupoPadreIdLocal)
      : null
    const contenedor = padre?.elementos ?? elementos
    const numero = contenedor.length + 1

    void (async () => {
      try {
        await gruposDeFasesPOST(
          torneoId,
          new GrupoDeFasesDTO({
            nombre: 'Grupo de fases',
            numero,
            grupoDeFasesPadreId: padre?.id ?? undefined
          })
        )
        await refetch()
        toast.success('Grupo de fases creado')
      } catch (e) {
        console.error(e)
        toast.error('No se pudo crear el grupo de fases')
      }
    })()
  }

  const eliminarGrupo = (grupoIdLocal: string) => {
    const grupo = encontrarGrupoPorIdLocal(elementos, grupoIdLocal)
    if (!grupo?.id) {
      setElementos((prev) => eliminarGrupoDevolviendoFases(prev, grupoIdLocal))
      return
    }
    void (async () => {
      try {
        await gruposDeFasesDELETE(torneoId, grupo.id!)
        setElementos((prev) =>
          eliminarGrupoDevolviendoFases(prev, grupoIdLocal)
        )
        await refetch()
        toast.success('Grupo eliminado')
      } catch (e) {
        console.error(e)
        toast.error('No se pudo eliminar el grupo')
      }
    })()
  }

  const handleDragEnd = useCallback(
    (activeId: string, overId: string | null) => {
      if (!overId || activeId === overId) return

      const faseTopId = parseFaseIdDesdeTopLevelDragId(activeId)
      if (faseTopId != null) {
        const grupoDestinoId = parseGrupoIdLocalDesdeCualquierId(overId)
        if (grupoDestinoId) {
          setElementos((prev) => {
            const nuevos = moverFaseTopLevelAGrupo(
              prev,
              faseTopId,
              grupoDestinoId
            )
            persistirEstructura(nuevos)
            return nuevos
          })
          return
        }

        setElementos((prev) => {
          const prevTopIds = prev.map(idTopLevelDesdeElemento)
          const prevOldIndex = prevTopIds.indexOf(activeId)
          let prevNewIndex = prevTopIds.indexOf(overId)
          if (prevNewIndex < 0) {
            const grupoTopId = parseGrupoIdLocalDesdeTopLevelDragId(overId)
            if (grupoTopId) {
              prevNewIndex = prevTopIds.findIndex(
                (rid) =>
                  parseGrupoIdLocalDesdeTopLevelDragId(rid) === grupoTopId
              )
            }
          }
          if (
            prevOldIndex < 0 ||
            prevNewIndex < 0 ||
            prevOldIndex === prevNewIndex
          ) {
            return prev
          }
          const nuevosElementos = reordenarElementosTopLevelPorIndices(
            prev,
            prevOldIndex,
            prevNewIndex
          )
          persistirEstructura(nuevosElementos)
          return nuevosElementos
        })
        return
      }

      const grupoTopId = parseGrupoIdLocalDesdeTopLevelDragId(activeId)
      if (grupoTopId != null) {
        setElementos((prev) => {
          const prevTopIds = prev.map(idTopLevelDesdeElemento)
          const oldIndex = prevTopIds.indexOf(activeId)
          let newIndex = prevTopIds.indexOf(overId)
          if (newIndex < 0) {
            const overGrupo = parseGrupoIdLocalDesdeTopLevelDragId(overId)
            if (overGrupo) {
              newIndex = prevTopIds.findIndex(
                (rid) => parseGrupoIdLocalDesdeTopLevelDragId(rid) === overGrupo
              )
            }
          }
          if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return prev
          const nuevos = reordenarElementosTopLevelPorIndices(
            prev,
            oldIndex,
            newIndex
          )
          persistirEstructura(nuevos)
          return nuevos
        })
        return
      }

      if (activeId.startsWith(PREFIJO_DRAG_FASE_GRUPO)) {
        const grupoOrigenId = parseGrupoIdLocalDesdeCualquierId(activeId)
        if (!grupoOrigenId) return

        const faseId = parseFaseIdDesdeFaseGrupoDragId(activeId)
        if (faseId == null) return

        const grupoDestinoId = parseGrupoIdLocalDesdeCualquierId(overId)

        if (grupoDestinoId && grupoDestinoId !== grupoOrigenId) {
          setElementos((prev) => {
            const nuevos = moverFaseEntreContenedores(
              prev,
              faseId,
              grupoDestinoId
            )
            persistirEstructura(nuevos)
            return nuevos
          })
          return
        }

        if (grupoDestinoId !== grupoOrigenId) {
          const faseTopOver = parseFaseIdDesdeTopLevelDragId(overId)
          if (faseTopOver != null) {
            setElementos((prev) => {
              const nuevos = moverFaseEntreContenedores(prev, faseId, null)
              persistirEstructura(nuevos)
              return nuevos
            })
          }
          return
        }

        const grupoIdLocal = grupoOrigenId

        setElementos((prev) => {
          const grupoEl = encontrarGrupoPorIdLocal(prev, grupoIdLocal)
          if (!grupoEl) return prev

          const ids = grupoEl.elementos.map((el, i) =>
            el.tipo === 'fase'
              ? idDragFaseEnGrupo(grupoIdLocal, el.fase, i)
              : idTopLevelDesdeElemento(el)
          )
          const oldIndex = ids.indexOf(activeId)
          let newIndex = ids.indexOf(overId)
          if (newIndex < 0 && overId === idDragGrupoDrop(grupoIdLocal)) {
            newIndex = ids.length - 1
          }
          if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return prev
          const nuevosElementos = reordenarEnGrupoPorIdLocal(
            prev,
            grupoIdLocal,
            oldIndex,
            newIndex
          )
          persistirEstructura(nuevosElementos)
          return nuevosElementos
        })
        return
      }

      const nestedGrupoId = parseGrupoIdLocalDesdeTopLevelDragId(activeId)
      if (nestedGrupoId && activeId.startsWith(PREFIJO_DRAG_GRUPO_TOP)) {
        const padreId = encontrarPadreGrupoIdLocal(elementos, nestedGrupoId)
        if (padreId == null) return

        setElementos((prev) => {
          const padre = encontrarGrupoPorIdLocal(prev, padreId)
          if (!padre) return prev

          const ids = padre.elementos.map(idTopLevelDesdeElemento)
          const oldIndex = ids.indexOf(activeId)
          let newIndex = ids.indexOf(overId)
          if (newIndex < 0) {
            const overFaseGrupo = parseGrupoIdLocalDesdeFaseGrupoId(overId)
            if (overFaseGrupo === padreId) {
              newIndex = ids.findIndex((id) =>
                id.startsWith(PREFIJO_DRAG_FASE_GRUPO)
              )
            }
          }
          if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return prev
          const nuevos = reordenarEnGrupoPorIdLocal(
            prev,
            padreId,
            oldIndex,
            newIndex
          )
          persistirEstructura(nuevos)
          return nuevos
        })
      }
    },
    [elementos, persistirEstructura]
  )

  const guardarMutation = useApiMutation<void>({
    fn: async () => {
      if (!torneo) return
      const {
        nombre,
        temporada,
        agrupadorId,
        categorias,
        seVenLosGolesEnTablaDePosiciones,
        horarioDeJuego
      } = getDatosBasicos()

      const body = new TorneoDTO({
        id: torneo.id,
        nombre,
        anio: parseInt(temporada, 10),
        torneoAgrupadorId: agrupadorId ?? undefined,
        categorias: categoriasACategoriaDto(categorias).map(
          (c) => new TorneoCategoriaDTO({ ...c, torneoId })
        ),
        fases: undefined,
        esVisibleEnApp: torneo.esVisibleEnApp,
        seVenLosGolesEnTablaDePosiciones,
        horarioDeJuego: horarioDeJuego.trim() || undefined
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
    setHorarioDeJuego(horarioParaInput(torneo.horarioDeJuego))
    setCategorias(categoriasDtoACategoria(torneo.categorias ?? []))
    setElementos(torneoAElementosDesdeDto(torneoConGrupos))
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

    const faseEnEstado = buscarFaseEnElementos(elementos, faseId)
    if (!faseEnEstado) return

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
    eliminarFasePorId,
    eliminarGrupo,
    agregarFaseMutation,
    agregarGrupoDeFases,
    eliminarFaseMutation,
    guardarMutation,
    estaGuardandoZonas:
      guardarMutation.isPending ||
      creandoZonasEliminacion ||
      persistirEstructuraMutation.isPending,
    irAZonas,
    handleCancelarEdicion,
    handleDragEnd,
    profundidadGrupo: (idLocal: string) => profundidadGrupo(idLocal, elementos)
  }
}

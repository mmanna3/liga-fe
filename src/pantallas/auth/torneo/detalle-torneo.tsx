import { api } from '@/api/api'
import { TorneoCategoriaDTO, TorneoDTO, TorneoFaseDTO } from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import useApiQuery from '@/api/hooks/use-api-query'
import { Card, CardContent } from '@/design-system/base-ui/card'
import { Boton } from '@/design-system/ykn-ui/boton'
import { Input } from '@/design-system/ykn-ui/input'
import LayoutSegundoNivel from '@/design-system/ykn-ui/layout-segundo-nivel'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Categorias } from './crear-torneo/components/categorias'
import { SelectorAgrupador } from './crear-torneo/components/selector-agrupador'
import { FaseItem } from './detalle-torneo/components/fase-item/fase-item'
import {
  categoriasACategoriaDto,
  categoriasDtoACategoria,
  formatoIdAOpción,
  type FaseEstado
} from './detalle-torneo/lib'

export default function DetalleTorneo() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
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

  const torneoFases = torneo?.fases ?? []

  const [editando, setEditando] = useState(false)
  const [nombre, setNombre] = useState('')
  const [temporada, setTemporada] = useState('')
  const [agrupadorId, setAgrupadorId] = useState<number | null>(null)
  const [categorias, setCategorias] = useState(categoriasDtoACategoria([]))
  const [fasesEstado, setFasesEstado] = useState<FaseEstado[]>([])

  useEffect(() => {
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

  function handleCancelarEdicion() {
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
        fases: undefined
      })
      await api.torneoPUT(torneoId, body)
    },
    antesDeMensajeExito: () => {
      refetch()
      setEditando(false)
    },
    mensajeDeExito: 'Torneo actualizado correctamente'
  })

  const guardarMutation = useApiMutation<void>({
    fn: async () => {
      if (!torneo) return
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

  if (isLoading) return <div>Cargando...</div>
  if (isError) return <div>Error al cargar el torneo</div>
  if (!torneo) return <div>No se encontró el torneo</div>

  const puedeEliminar = torneoFases.length === 0

  const irAZonas = async (faseIndex: number) => {
    const faseEnEstado = fasesEstado[faseIndex]
    if (!faseEnEstado) return

    const faseTieneId = faseEnEstado.id != null && faseEnEstado.id > 0

    if (!faseTieneId) {
      // Fase nueva: hay que guardar antes para que exista en el backend y tenga id
      await guardarMutation.mutateAsync(undefined)
      const torneoActualizado = await queryClient.fetchQuery({
        queryKey: ['torneo', id],
        queryFn: () => api.torneoGET(torneoId)
      })
      const faseActualizada = torneoActualizado?.fases?.find(
        (f) => f.numero === faseEnEstado.numero
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

  return (
    <LayoutSegundoNivel
      titulo={`${torneo.nombre}`}
      iconoTitulo='Torneos'
      pathBotonVolver={rutasNavegacion.torneos}
      maxWidth='2xl'
      contenidoEnCard={false}
      botonera={{
        iconos: [
          {
            icono: 'Editar' as const,
            alApretar: () => setEditando(true),
            tooltip: 'Editar torneo'
          },
          {
            alApretar: () => eliminarMutation.mutate(undefined),
            tooltip: 'Eliminar',
            puedeEliminar,
            textoNoSePuedeEliminar:
              'Este torneo tiene fases. Para eliminar el torneo, eliminá primero las fases que tiene.',
            modalEliminacion: {
              titulo: 'Eliminar torneo',
              subtitulo: `¿Estás seguro de que querés eliminar el torneo "${torneo.nombre}"? Esta acción no se puede deshacer.`,
              estaCargando: eliminarMutation.isPending
            }
          }
        ]
      }}
      contenido={
        <div className='space-y-4'>
          <Card className='shadow-md'>
            <CardContent className='pt-6 space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                {editando ? (
                  <>
                    <Input
                      tipo='text'
                      titulo='Nombre del torneo *'
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder='Ej: Torneo Anual 2026'
                    />
                    <Input
                      tipo='number'
                      titulo='Temporada/Año *'
                      value={temporada}
                      onChange={(e) => setTemporada(e.target.value)}
                      placeholder='2026'
                    />
                  </>
                ) : (
                  <>
                    <div>
                      <label className='text-sm font-semibold text-muted-foreground block mb-2'>
                        Nombre del torneo
                      </label>
                      <p className='font-medium'>{nombre || '—'}</p>
                    </div>
                    <div>
                      <label className='text-sm font-semibold text-muted-foreground block mb-2'>
                        Temporada/Año
                      </label>
                      <p className='font-medium'>{temporada || '—'}</p>
                    </div>
                  </>
                )}
              </div>

              {editando ? (
                <SelectorAgrupador
                  valor={agrupadorId}
                  alCambiar={setAgrupadorId}
                />
              ) : (
                <div>
                  <label className='text-sm font-semibold text-muted-foreground block mb-2'>
                    Agrupador
                  </label>
                  <p className='font-medium'>
                    {torneo.torneoAgrupadorNombre ?? '—'}
                  </p>
                </div>
              )}

              <Categorias
                valor={categorias}
                alCambiar={setCategorias}
                soloLectura={!editando}
              />

              {editando && (
                <div className='flex justify-end gap-2 pt-2 border-t'>
                  <Boton
                    variant='outline'
                    onClick={handleCancelarEdicion}
                    disabled={guardarDatosBasicosMutation.isPending}
                  >
                    Cancelar
                  </Boton>
                  <Boton
                    estaCargando={guardarDatosBasicosMutation.isPending}
                    onClick={() => guardarDatosBasicosMutation.mutate()}
                  >
                    Guardar
                  </Boton>
                </div>
              )}
            </CardContent>
          </Card>

          {fasesEstado.map((fase, index) => (
            <Card key={fase.id ?? index} className='shadow-md'>
              <CardContent className='pt-6'>
                <FaseItem
                  torneoId={torneoId}
                  fase={fase}
                  faseIndex={index}
                  faseOriginal={torneoFases[index]}
                  onActualizar={(campo, valor) =>
                    actualizarFase(index, campo, valor)
                  }
                  onEliminar={() => eliminarFase(index)}
                  onIrAZonas={irAZonas}
                  estaGuardando={guardarMutation.isPending}
                  enCard
                />
              </CardContent>
            </Card>
          ))}

          {!editando && (
            <Boton
              type='button'
              variant='outline'
              size='sm'
              onClick={() => agregarFaseMutation.mutate()}
              estaCargando={agregarFaseMutation.isPending}
              className='my-2'
            >
              <Plus className='w-3 h-3' />
              Agregar fase
            </Boton>
          )}
        </div>
      }
    />
  )
}

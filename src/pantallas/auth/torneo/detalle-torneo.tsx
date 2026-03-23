import { rutasNavegacion } from '@/ruteo/rutas'
import { Card, CardContent } from '@/design-system/base-ui/card'
import { Boton } from '@/design-system/ykn-ui/boton'
import { Input } from '@/design-system/ykn-ui/input'
import LayoutSegundoNivel from '@/design-system/ykn-ui/layout-segundo-nivel'
import { Plus } from 'lucide-react'
import { useDetalleTorneo } from './detalle-torneo/hooks/use-detalle-torneo'
import { useFases } from './detalle-torneo/hooks/use-fases'
import { Categorias } from './crear-torneo/components/categorias'
import { SelectorAgrupador } from './crear-torneo/components/selector-agrupador'
import { FaseItem } from './detalle-torneo/components/fase-item/fase-item'

export default function DetalleTorneo() {
  const detalle = useDetalleTorneo()
  const {
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
    eliminarMutation,
    guardarDatosBasicosMutation
  } = detalle

  const fases = useFases({
    torneo,
    torneoId,
    id,
    refetch,
    getDatosBasicos: () => ({
      nombre,
      temporada,
      agrupadorId,
      categorias
    }),
    setNombre,
    setTemporada,
    setAgrupadorId,
    setCategorias,
    setEditando
  })

  const {
    torneoFases,
    fasesEstado,
    actualizarFase,
    eliminarFase,
    agregarFaseMutation,
    guardarMutation,
    irAZonas,
    handleCancelarEdicion
  } = fases

  if (isLoading) return <div>Cargando...</div>
  if (isError) return <div>Error al cargar el torneo</div>
  if (!torneo) return <div>No se encontró el torneo</div>

  const puedeEliminar = torneoFases.length === 0

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

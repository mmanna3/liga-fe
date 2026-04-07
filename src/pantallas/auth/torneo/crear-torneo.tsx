import { Boton } from '@/design-system/ykn-ui/boton'
import { Input } from '@/design-system/ykn-ui/input'
import LayoutSegundoNivel from '@/design-system/ykn-ui/layout-segundo-nivel'
import SelectorSimple from '@/design-system/ykn-ui/selector-simple'
import { rutasNavegacion } from '@/ruteo/rutas'
import { Categorias } from './crear-torneo/components/categorias'
import { SelectorAgrupador } from './crear-torneo/components/selector-agrupador'
import { SwitchVerGoles } from './crear-torneo/components/switch-ver-goles'
import { TituloFase } from './crear-torneo/components/titulo-fase'
import { useCrearTorneo } from './crear-torneo/hooks/use-crear-torneo'
import type { Categoria } from './crear-torneo/tipos'

export default function CrearTorneo() {
  const {
    handleSubmit,
    setValue,
    errors,
    mutacion,
    datos,
    tituloFase,
    setTituloFase,
    formatoFase,
    setFormatoFase,
    OPCIONES_FORMATO
  } = useCrearTorneo()

  return (
    <LayoutSegundoNivel
      titulo='Crear nuevo torneo'
      subtitulo='Completá los datos para crear un torneo'
      pathBotonVolver={rutasNavegacion.torneos}
      maxWidth='2xl'
      contenido={
        <form
          onSubmit={handleSubmit((d) =>
            mutacion.mutate({
              datos: d,
              tituloFase,
              formatoFase
            })
          )}
          className='space-y-4'
        >
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            <Input
              tipo='text'
              titulo='Nombre del torneo'
              value={datos.nombre}
              onChange={(e) => setValue('nombre', e.target.value)}
              placeholder='Ej: Torneo Anual 2026'
              error={errors.nombre?.message}
            />
            <Input
              tipo='number'
              titulo='Temporada/Año'
              value={datos.temporada}
              onChange={(e) => setValue('temporada', e.target.value)}
              placeholder='2026'
              error={errors.temporada?.message}
            />
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            <SwitchVerGoles
              value={datos.seVenLosGolesEnTablaDePosiciones}
              onChange={(v) => setValue('seVenLosGolesEnTablaDePosiciones', v)}
            />
          </div>

          <SelectorAgrupador
            valor={datos.agrupadorId ?? null}
            alCambiar={(id) =>
              setValue('agrupadorId', id != null ? id : undefined)
            }
            error={errors.agrupadorId?.message}
          />

          <Categorias
            valor={datos.categorias}
            alCambiar={(categorias: Categoria[]) =>
              setValue('categorias', categorias)
            }
            error={errors.categorias?.message}
          />

          <div className='space-y-4 pt-6 border-t'>
            <TituloFase valor={tituloFase} alCambiar={setTituloFase} />
            <SelectorSimple
              titulo='Formato'
              opciones={OPCIONES_FORMATO}
              valorActual={formatoFase}
              alElegirOpcion={setFormatoFase}
            />
          </div>

          <div className='flex justify-end pt-4 border-t'>
            <Boton
              type='submit'
              className='h-11 w-40 text-sm'
              estaCargando={mutacion.isPending}
            >
              Crear torneo
            </Boton>
          </div>
        </form>
      }
    />
  )
}

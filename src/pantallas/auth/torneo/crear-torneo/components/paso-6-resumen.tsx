import { Boton } from '@/design-system/ykn-ui/boton'
import { cn } from '@/logica-compartida/utils'
import {
  Calendar,
  CheckCircle,
  Edit,
  MapPin,
  Target,
  Trophy,
  Users
} from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import type { DatosWizardTorneo } from '../tipos'
import { useStoreWizard } from '../use-store-wizard'
import { VistaBracket } from './vista-bracket'

interface Paso6ResumenProps {
  alEditarPaso?: (paso: number) => void
}

export function Paso6Resumen({ alEditarPaso }: Paso6ResumenProps) {
  const { watch, setValue } = useFormContext<DatosWizardTorneo>()
  const { irAlPaso } = useStoreWizard()

  const editarPaso = (paso: number) => {
    if (alEditarPaso) alEditarPaso(paso)
    else irAlPaso(paso)
  }

  const datos = {
    nombre: watch('nombre'),
    temporada: watch('temporada'),
    tipo: watch('tipo'),
    categorias: watch('categorias'),
    fases: watch('fases'),
    indiceFaseActual: watch('indiceFaseActual'),
    equiposSeleccionados: watch('equiposSeleccionados'),
    zonas: watch('zonas'),
    prevenirMismoClub: watch('prevenirMismoClub'),
    fixtureGenerado: watch('fixtureGenerado'),
    fechasLibres: watch('fechasLibres'),
    fechasInterzonales: watch('fechasInterzonales'),
    estado: watch('estado')
  }

  const faseActual = datos.fases[datos.indiceFaseActual] ?? datos.fases[0]
  const nombrePrimeraFase = datos.fases[0]?.nombre ?? 'Fase 1'

  const etiquetasTipo: Record<string, string> = {
    FUTSAL: 'Futsal',
    BABY: 'Baby',
    'FUTBOL 11': 'Fútbol 11',
    FEMENINO: 'Femenino'
  }

  const obtenerTextoFormato = (fase: (typeof datos.fases)[number]) => {
    if (!fase) return ''

    const textoFormato =
      fase.formato === 'all-vs-all'
        ? 'Todos contra todos'
        : 'Eliminación directa'
    const textoVueltas = fase.vueltas === 'double' ? 'Ida y vuelta' : 'Solo ida'

    return `${textoFormato} - ${textoVueltas}`
  }

  return (
    <div className='space-y-4'>
      <div className='text-center mb-6'>
        <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3'>
          <CheckCircle className='w-10 h-10 text-primary' />
        </div>
        <h3 className='text-lg font-semibold mb-1'>
          Resumen de {datos.nombre}
        </h3>
        <p className='text-muted-foreground text-sm'>
          Revisa la configuración antes de crear el torneo
        </p>
      </div>

      <div className='bg-muted rounded-xl p-4'>
        <div className='flex items-center justify-between mb-3'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center'>
              <Trophy className='w-4 h-4 text-primary-foreground' />
            </div>
            <h4 className='font-semibold text-sm'>Información general</h4>
          </div>
          <Boton
            type='button'
            variant='ghost'
            size='icon'
            className='h-8 w-8'
            onClick={() => editarPaso(1)}
          >
            <Edit className='w-4 h-4' />
          </Boton>
        </div>
        <div className='grid grid-cols-2 gap-3 text-sm'>
          <div>
            <p className='text-xs text-muted-foreground mb-0.5'>Nombre - Año</p>
            <p className='font-medium'>
              {datos.nombre || '-'} - {datos.temporada}
            </p>
          </div>
          <div>
            <p className='text-xs text-muted-foreground mb-0.5'>Tipo</p>
            <p className='font-medium'>
              {datos.tipo ? (etiquetasTipo[datos.tipo] ?? datos.tipo) : '-'}
            </p>
          </div>
          <div className='col-span-2'>
            <p className='text-xs text-muted-foreground mb-1'>Categorías</p>
            <div className='flex flex-wrap gap-1.5'>
              {datos.categorias
                .filter((c) => c.nombre)
                .map((cat) => (
                  <span
                    key={cat.id}
                    className='px-2 py-0.5 bg-background rounded text-xs font-medium'
                  >
                    {cat.nombre}
                    {cat.anioDesde &&
                      cat.anioDesde !== 'TODAS' &&
                      ` (${cat.anioDesde}/${cat.anioHasta})`}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>

      {datos.fases.length > 0 && (
        <div className='bg-muted rounded-xl p-4'>
          <div className='flex items-center justify-between mb-3'>
            <div className='flex items-center gap-2'>
              <div className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center'>
                <Calendar className='w-4 h-4 text-primary-foreground' />
              </div>
              <h4 className='font-semibold text-sm'>Fases del torneo</h4>
            </div>
            <Boton
              type='button'
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => editarPaso(2)}
            >
              <Edit className='w-4 h-4' />
            </Boton>
          </div>
          <div className='space-y-2'>
            {datos.fases.map((fase, idx) => (
              <div key={fase.id} className='bg-background rounded-lg p-3'>
                <div className='flex items-center gap-2 mb-2'>
                  <span className='w-6 h-6 bg-primary text-primary-foreground rounded-md flex items-center justify-center text-xs font-bold'>
                    {idx + 1}
                  </span>
                  <span className='font-semibold text-sm'>{fase.nombre}</span>
                </div>
                <div className='text-xs text-muted-foreground'>
                  <span className='font-medium'>Formato:</span>{' '}
                  {obtenerTextoFormato(fase)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className='bg-muted rounded-xl p-4'>
        <div className='flex items-center justify-between mb-3'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center'>
              <Users className='w-4 h-4 text-primary-foreground' />
            </div>
            <h4 className='font-semibold text-sm'>
              Equipos participantes de la fase {nombrePrimeraFase}
            </h4>
          </div>
          <Boton
            type='button'
            variant='ghost'
            size='icon'
            className='h-8 w-8'
            onClick={() => editarPaso(3)}
          >
            <Edit className='w-4 h-4' />
          </Boton>
        </div>
        <div className='space-y-2'>
          <div className='flex items-center gap-2 text-sm'>
            <p className='text-muted-foreground'>
              {datos.equiposSeleccionados.length} equipos
            </p>
            {datos.equiposSeleccionados.length % 2 !== 0 && (
              <span className='px-2 py-0.5 bg-amber-200 text-amber-800 rounded text-xs font-medium'>
                Impar
              </span>
            )}
          </div>
          {datos.equiposSeleccionados.length > 0 && (
            <div className='flex flex-wrap gap-1.5 mt-2'>
              {datos.equiposSeleccionados.slice(0, 15).map((equipo) => (
                <span
                  key={equipo.id}
                  className='px-2 py-1 bg-background rounded text-xs font-medium shadow-sm'
                >
                  {equipo.nombre}
                </span>
              ))}
              {datos.equiposSeleccionados.length > 15 && (
                <span className='px-2 py-1 bg-secondary rounded text-xs font-medium'>
                  +{datos.equiposSeleccionados.length - 15} más
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {datos.zonas.length > 0 && (
        <div className='bg-muted rounded-xl p-4'>
          <div className='flex items-center justify-between mb-3'>
            <div className='flex items-center gap-2'>
              <div className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center'>
                <MapPin className='w-4 h-4 text-primary-foreground' />
              </div>
              <h4 className='font-semibold text-sm'>
                Zonas de la fase {nombrePrimeraFase}
              </h4>
            </div>
            <Boton
              type='button'
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => editarPaso(4)}
            >
              <Edit className='w-4 h-4' />
            </Boton>
          </div>
          <div className='grid grid-cols-2 gap-2'>
            {datos.zonas.map((zona) => (
              <div key={zona.id} className='bg-background rounded-lg p-2'>
                <p className='font-semibold text-xs mb-1'>{zona.nombre}</p>
                <p className='text-xs text-muted-foreground'>
                  {zona.equipos.length} equipo
                  {zona.equipos.length !== 1 ? 's' : ''}
                </p>
                <div className='mt-1 space-y-0.5'>
                  {zona.equipos.slice(0, 2).map((equipo) => (
                    <p key={equipo.id} className='text-xs'>
                      • {equipo.nombre}
                    </p>
                  ))}
                  {zona.equipos.length > 2 && (
                    <p className='text-xs text-muted-foreground'>
                      +{zona.equipos.length - 2} más
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          {datos.prevenirMismoClub && (
            <div className='mt-2 p-2 bg-primary/10 rounded-lg'>
              <p className='text-xs font-medium'>
                Restricción: Mismo club no en misma zona
              </p>
            </div>
          )}
        </div>
      )}

      <div className='bg-muted rounded-xl p-4'>
        <div className='flex items-center justify-between mb-3'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center'>
              <Target className='w-4 h-4 text-primary-foreground' />
            </div>
            <h4 className='font-semibold text-sm'>
              Fixture de la fase {nombrePrimeraFase}
            </h4>
          </div>
          <Boton
            type='button'
            variant='ghost'
            size='icon'
            className='h-8 w-8'
            onClick={() => editarPaso(5)}
          >
            <Edit className='w-4 h-4' />
          </Boton>
        </div>
        <div className='space-y-2'>
          {datos.fixtureGenerado ? (
            <>
              <p className='text-sm text-muted-foreground'>
                Fixture generado exitosamente
              </p>
              {datos.zonas.some((z) => (z.fechasLibres ?? 0) > 0) ? (
                <p className='text-sm text-muted-foreground'>
                  • Libre por zona:{' '}
                  {datos.zonas
                    .filter((z) => (z.fechasLibres ?? 0) > 0)
                    .map((z) => `${z.nombre} (${z.fechasLibres})`)
                    .join(', ')}
                </p>
              ) : (
                datos.fechasLibres > 0 && (
                  <p className='text-sm text-muted-foreground'>
                    • {datos.fechasLibres} jornada
                    {datos.fechasLibres !== 1 ? 's' : ''} libre por equipo
                  </p>
                )
              )}
              {datos.zonas.some((z) => (z.fechasInterzonales ?? 0) > 0) ? (
                <p className='text-sm text-muted-foreground'>
                  • Interzonal por zona:{' '}
                  {datos.zonas
                    .filter((z) => (z.fechasInterzonales ?? 0) > 0)
                    .map((z) => `${z.nombre} (${z.fechasInterzonales})`)
                    .join(', ')}
                </p>
              ) : (
                datos.fechasInterzonales > 0 && (
                  <p className='text-sm text-muted-foreground'>
                    • {datos.fechasInterzonales} jornada
                    {datos.fechasInterzonales !== 1 ? 's' : ''} interzonal por
                    equipo
                  </p>
                )
              )}

              {faseActual?.formato === 'elimination' && (
                <div className='mt-3 bg-background rounded-lg p-3'>
                  <h5 className='font-semibold text-xs mb-2'>
                    Vista de llaves
                  </h5>
                  <VistaBracket
                    totalSlots={datos.equiposSeleccionados.length}
                    equipos={datos.equiposSeleccionados.map((e) => ({
                      nombre: e.nombre
                    }))}
                    zonas={datos.zonas}
                  />
                </div>
              )}
            </>
          ) : (
            <div className='bg-amber-50 border border-amber-200 rounded-xl p-3'>
              <div className='flex items-start gap-2'>
                <div className='flex-1'>
                  <p className='font-semibold text-sm mb-1'>
                    Fixture no generado
                  </p>
                  <p className='text-xs text-muted-foreground mb-2'>
                    Es necesario generar el fixture antes de crear el torneo.
                  </p>
                  <Boton type='button' size='sm' onClick={() => editarPaso(5)}>
                    <Target className='w-3 h-3' />
                    Ir al paso 5 para generar fixture
                  </Boton>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className='bg-muted rounded-xl p-6 border'>
        <div className='text-center mb-4'>
          <h4 className='text-lg font-bold mb-1'>
            ¿Listo para crear el torneo?
          </h4>
          <p className='text-xs text-muted-foreground'>
            Selecciona si deseas guardar el torneo como borrador o publicarlo
            inmediatamente
          </p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          <button
            type='button'
            onClick={() => setValue('estado', 'draft')}
            className={cn(
              'px-6 py-4 rounded-xl font-semibold transition-all text-center',
              datos.estado === 'draft'
                ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                : 'bg-background border-2 text-muted-foreground hover:bg-accent'
            )}
          >
            <div className='text-sm'>Guardar como borrador</div>
            <p className='text-xs mt-1 opacity-80'>Podrás editarlo más tarde</p>
          </button>
          <button
            type='button'
            onClick={() => setValue('estado', 'published')}
            className={cn(
              'px-6 py-4 rounded-xl font-semibold transition-all text-center',
              datos.estado === 'published'
                ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                : 'bg-background border-2 text-muted-foreground hover:bg-accent'
            )}
          >
            <div className='text-sm'>Publicar</div>
            <p className='text-xs mt-1 opacity-80'>
              La fase {nombrePrimeraFase} estará visible en la app y en la web.
              Las demás permanecerán ocultas hasta que se las marque como
              visibles.
            </p>
          </button>
        </div>
      </div>
    </div>
  )
}

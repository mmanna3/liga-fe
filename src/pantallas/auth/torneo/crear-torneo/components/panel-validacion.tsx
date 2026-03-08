import { Boton } from '@/design-system/ykn-ui/boton'
import { cn } from '@/logica-compartida/utils'
import { AlertTriangle, Info, Wand2 } from 'lucide-react'
import type {
  ValidacionEmparejamientoInterzonal,
  EntradaDeZona,
  ValidacionZona
} from '../lib/fixture-tipos'

interface PanelValidacionProps {
  configValida: boolean
  esEliminacion: boolean
  esTodosContraTodos: boolean
  usarModoZona: boolean
  tieneMultiplesZonas: boolean
  validacionesZona: ValidacionZona[]
  emparejamientoInterzonal: ValidacionEmparejamientoInterzonal
  entradasDeZona: EntradaDeZona[]
  totalFechas: number
  vueltas: 'ida' | 'ida-y-vuelta'
  cantidadEquipos: number
  fechasLibres: number
  fechasInterzonales: number
  fixtureGenerado: boolean
  errorFixture?: string
  alGenerar: () => void
}

export function PanelValidacion({
  configValida,
  esEliminacion,
  esTodosContraTodos,
  usarModoZona,
  tieneMultiplesZonas,
  validacionesZona,
  emparejamientoInterzonal,
  entradasDeZona,
  totalFechas,
  vueltas,
  cantidadEquipos,
  fechasLibres,
  fechasInterzonales,
  fixtureGenerado,
  errorFixture,
  alGenerar
}: PanelValidacionProps) {
  return (
    <>
      {/* Resumen de validación */}
      <div
        className={cn(
          'p-3 rounded-lg border',
          configValida
            ? 'bg-muted border-transparent'
            : 'bg-destructive/10 border-destructive/30'
        )}
      >
        {configValida ? (
          <ResumenValido
            usarModoZona={usarModoZona}
            tieneMultiplesZonas={tieneMultiplesZonas}
            validacionesZona={validacionesZona}
            entradasDeZona={entradasDeZona}
            emparejamientoInterzonal={emparejamientoInterzonal}
            esEliminacion={esEliminacion}
            totalFechas={totalFechas}
            vueltas={vueltas}
            cantidadEquipos={cantidadEquipos}
            fechasLibres={fechasLibres}
            fechasInterzonales={fechasInterzonales}
          />
        ) : (
          <ResumenInvalido
            usarModoZona={usarModoZona}
            esEliminacion={esEliminacion}
            validacionesZona={validacionesZona}
            emparejamientoInterzonal={emparejamientoInterzonal}
            cantidadEquipos={cantidadEquipos}
            fechasLibres={fechasLibres}
            fechasInterzonales={fechasInterzonales}
          />
        )}
      </div>

      {/* Botón generar */}
      <Boton
        type='button'
        onClick={alGenerar}
        className='w-full'
        disabled={(esTodosContraTodos || esEliminacion) && !configValida}
      >
        <Wand2 className='w-5 h-5' />
        {fixtureGenerado ? 'Regenerar fixture' : 'Generar fixture'}
      </Boton>

      {errorFixture && (
        <div className='p-3 bg-destructive/10 border border-destructive/30 rounded-lg'>
          <p className='text-sm text-destructive'>{errorFixture}</p>
        </div>
      )}
    </>
  )
}

function ResumenValido({
  usarModoZona,
  tieneMultiplesZonas,
  validacionesZona,
  entradasDeZona,
  emparejamientoInterzonal,
  esEliminacion,
  totalFechas,
  vueltas,
  cantidadEquipos,
  fechasLibres,
  fechasInterzonales
}: {
  usarModoZona: boolean
  tieneMultiplesZonas: boolean
  validacionesZona: ValidacionZona[]
  entradasDeZona: EntradaDeZona[]
  emparejamientoInterzonal: ValidacionEmparejamientoInterzonal
  esEliminacion: boolean
  totalFechas: number
  vueltas: 'ida' | 'ida-y-vuelta'
  cantidadEquipos: number
  fechasLibres: number
  fechasInterzonales: number
}) {
  return (
    <div className='space-y-1'>
      {usarModoZona ? (
        <>
          {validacionesZona.map((vz) => {
            const z = entradasDeZona.find((x) => x.id === vz.idZona)
            const libre = z?.fechasLibres ?? 0
            const iz = z?.fechasInterzonales ?? 0
            return (
              <p key={vz.idZona} className='text-sm'>
                <strong>
                  {vz.nombreZona}: {vz.cantidadEquipos} equipos + {libre} libre
                  {tieneMultiplesZonas &&
                    iz > 0 &&
                    ` + ${iz} interzonal`} = {vz.totalParticipantes}{' '}
                  participantes
                </strong>
              </p>
            )
          })}
          <p className='text-sm text-muted-foreground'>
            {esEliminacion ? (
              <>
                Configuración válida para eliminación directa por zona.
                {tieneMultiplesZonas &&
                  entradasDeZona.some((z) => z.fechasInterzonales > 0) &&
                  ' Los partidos interzonales cruzan equipos entre zonas.'}
              </>
            ) : (
              <>
                Cada zona tendrá hasta{' '}
                <strong className='text-foreground'>
                  {totalFechas} fechas
                </strong>{' '}
                ({vueltas === 'ida-y-vuelta' ? 'ida y vuelta' : 'solo ida'}).
                {tieneMultiplesZonas &&
                  entradasDeZona.some((z) => z.fechasInterzonales > 0) &&
                  ' Los partidos interzonales cruzan equipos entre zonas.'}
              </>
            )}
          </p>
        </>
      ) : (
        <>
          <p className='text-sm'>
            <strong>
              {cantidadEquipos} equipos + {fechasLibres} libre +{' '}
              {fechasInterzonales} interzonal ={' '}
              {cantidadEquipos + fechasLibres + fechasInterzonales}{' '}
              participantes
            </strong>
          </p>
          <p className='text-sm text-muted-foreground'>
            {esEliminacion ? (
              <>Configuración válida para eliminación directa.</>
            ) : (
              <>
                El torneo tendrá{' '}
                <strong className='text-foreground'>
                  {totalFechas} jornadas
                </strong>{' '}
                ({vueltas === 'ida-y-vuelta' ? 'ida y vuelta' : 'solo ida'}).
              </>
            )}
          </p>
        </>
      )}
      {!usarModoZona && fechasLibres > 0 && (
        <p className='text-xs text-muted-foreground flex items-center gap-1'>
          <Info className='w-3 h-3 shrink-0' />
          Cada equipo descansa {fechasLibres} jornada
          {fechasLibres !== 1 ? 's' : ''}.
        </p>
      )}
      {!usarModoZona && fechasInterzonales > 0 && (
        <p className='text-xs text-muted-foreground flex items-center gap-1'>
          <Info className='w-3 h-3 shrink-0' />
          Cada equipo juega {fechasInterzonales} jornada
          {fechasInterzonales !== 1 ? 's' : ''} interzonal.
        </p>
      )}
      {usarModoZona &&
        tieneMultiplesZonas &&
        entradasDeZona.some((z) => z.fechasInterzonales > 0) &&
        emparejamientoInterzonal.esValido && (
          <p className='text-xs text-muted-foreground flex items-center gap-1'>
            <Info className='w-3 h-3 shrink-0' />
            Todas las zonas tienen la misma cantidad interzonal: emparejamiento
            correcto.
          </p>
        )}
    </div>
  )
}

function ResumenInvalido({
  usarModoZona,
  esEliminacion,
  validacionesZona,
  emparejamientoInterzonal,
  cantidadEquipos,
  fechasLibres,
  fechasInterzonales
}: {
  usarModoZona: boolean
  esEliminacion: boolean
  validacionesZona: ValidacionZona[]
  emparejamientoInterzonal: ValidacionEmparejamientoInterzonal
  cantidadEquipos: number
  fechasLibres: number
  fechasInterzonales: number
}) {
  return (
    <div className='flex items-start gap-2'>
      <AlertTriangle className='w-4 h-4 text-destructive shrink-0 mt-0.5' />
      <div>
        <p className='text-sm font-medium text-destructive'>
          {esEliminacion
            ? 'La cantidad total de participantes debe ser potencia de 2 (2, 4, 8, 16...) en cada zona'
            : 'La cantidad total de participantes debe ser par en cada zona'}
        </p>
        <p className='text-xs text-destructive/80 mt-0.5'>
          {usarModoZona
            ? !emparejamientoInterzonal.esValido
              ? emparejamientoInterzonal.mensaje
              : validacionesZona
                  .filter((v) => !v.esValida)
                  .map((v) => {
                    const mal = esEliminacion ? 'no es potencia de 2' : 'impar'
                    return `${v.nombreZona}: ${v.cantidadEquipos} + ${v.totalParticipantes - v.cantidadEquipos} = ${v.totalParticipantes} (${mal}). `
                  })
                  .join(' ') || 'Ajustá libre o interzonal por zona.'
            : `Actualmente: ${cantidadEquipos} equipos + ${fechasLibres} libre + ${fechasInterzonales} interzonal = ${cantidadEquipos + fechasLibres + fechasInterzonales} (${esEliminacion ? 'no es potencia de 2' : 'impar'}). Ajustá la cantidad de fechas libre o interzonal.`}
        </p>
      </div>
    </div>
  )
}

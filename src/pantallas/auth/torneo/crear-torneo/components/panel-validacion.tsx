import { Boton } from '@/design-system/ykn-ui/boton'
import { cn } from '@/logica-compartida/utils'
import { AlertTriangle, Info, Wand2 } from 'lucide-react'
import type {
  InterzonalPairingValidation,
  ZoneInput,
  ZoneValidation
} from '../lib/fixture'

interface PanelValidacionProps {
  configValida: boolean
  esEliminacion: boolean
  esTodosContraTodos: boolean
  usarModoZona: boolean
  tieneMultiplesZonas: boolean
  validacionesZona: ZoneValidation[]
  emparejamientoInterzonal: InterzonalPairingValidation
  entradasDeZona: ZoneInput[]
  totalFechas: number
  vueltas: 'single' | 'double'
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
  validacionesZona: ZoneValidation[]
  entradasDeZona: ZoneInput[]
  emparejamientoInterzonal: InterzonalPairingValidation
  esEliminacion: boolean
  totalFechas: number
  vueltas: 'single' | 'double'
  cantidadEquipos: number
  fechasLibres: number
  fechasInterzonales: number
}) {
  return (
    <div className='space-y-1'>
      {usarModoZona ? (
        <>
          {validacionesZona.map((vz) => {
            const z = entradasDeZona.find((x) => x.id === vz.zoneId)
            const libre = z?.freeDates ?? 0
            const iz = z?.interzonalDates ?? 0
            return (
              <p key={vz.zoneId} className='text-sm'>
                <strong>
                  {vz.zoneName}: {vz.teamCount} equipos + {libre} libre
                  {tieneMultiplesZonas &&
                    iz > 0 &&
                    ` + ${iz} interzonal`} = {vz.totalParticipants}{' '}
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
                  entradasDeZona.some((z) => z.interzonalDates > 0) &&
                  ' Los partidos interzonales cruzan equipos entre zonas.'}
              </>
            ) : (
              <>
                Cada zona tendrá hasta{' '}
                <strong className='text-foreground'>
                  {totalFechas} fechas
                </strong>{' '}
                ({vueltas === 'double' ? 'ida y vuelta' : 'solo ida'}).
                {tieneMultiplesZonas &&
                  entradasDeZona.some((z) => z.interzonalDates > 0) &&
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
                ({vueltas === 'double' ? 'ida y vuelta' : 'solo ida'}).
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
        entradasDeZona.some((z) => z.interzonalDates > 0) &&
        emparejamientoInterzonal.isValid && (
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
  validacionesZona: ZoneValidation[]
  emparejamientoInterzonal: InterzonalPairingValidation
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
            ? !emparejamientoInterzonal.isValid
              ? emparejamientoInterzonal.message
              : validacionesZona
                  .filter((v) => !v.isValid)
                  .map((v) => {
                    const mal = esEliminacion ? 'no es potencia de 2' : 'impar'
                    return `${v.zoneName}: ${v.teamCount} + ${v.totalParticipants - v.teamCount} = ${v.totalParticipants} (${mal}). `
                  })
                  .join(' ') || 'Ajustá libre o interzonal por zona.'
            : `Actualmente: ${cantidadEquipos} equipos + ${fechasLibres} libre + ${fechasInterzonales} interzonal = ${cantidadEquipos + fechasLibres + fechasInterzonales} (${esEliminacion ? 'no es potencia de 2' : 'impar'}). Ajustá la cantidad de fechas libre o interzonal.`}
        </p>
      </div>
    </div>
  )
}

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { AlertTriangle, Info, Wand2 } from 'lucide-react'
import type {
  InterzonalPairingValidation,
  ZoneInput,
  ZoneValidation
} from '../lib/fixture'

interface PanelValidacionProps {
  validConfig: boolean
  isElimination: boolean
  isAllVsAll: boolean
  useZoneMode: boolean
  hasMultipleZones: boolean
  zoneValidations: ZoneValidation[]
  interzonalPairing: InterzonalPairingValidation
  zoneInputs: ZoneInput[]
  totalDates: number
  rounds: 'single' | 'double'
  teamCount: number
  freeDates: number
  interzonalDates: number
  fixtureGenerated: boolean
  fixtureError?: string
  onGenerate: () => void
}

export function PanelValidacion({
  validConfig,
  isElimination,
  isAllVsAll,
  useZoneMode,
  hasMultipleZones,
  zoneValidations,
  interzonalPairing,
  zoneInputs,
  totalDates,
  rounds,
  teamCount,
  freeDates,
  interzonalDates,
  fixtureGenerated,
  fixtureError,
  onGenerate
}: PanelValidacionProps) {
  return (
    <>
      {/* Resumen de validación */}
      <div
        className={cn(
          'p-3 rounded-lg border',
          validConfig
            ? 'bg-muted border-transparent'
            : 'bg-destructive/10 border-destructive/30'
        )}
      >
        {validConfig ? (
          <ValidSummary
            useZoneMode={useZoneMode}
            hasMultipleZones={hasMultipleZones}
            zoneValidations={zoneValidations}
            zoneInputs={zoneInputs}
            interzonalPairing={interzonalPairing}
            isElimination={isElimination}
            totalDates={totalDates}
            rounds={rounds}
            teamCount={teamCount}
            freeDates={freeDates}
            interzonalDates={interzonalDates}
          />
        ) : (
          <InvalidSummary
            useZoneMode={useZoneMode}
            isElimination={isElimination}
            zoneValidations={zoneValidations}
            interzonalPairing={interzonalPairing}
            teamCount={teamCount}
            freeDates={freeDates}
            interzonalDates={interzonalDates}
          />
        )}
      </div>

      {/* Botón generar */}
      <Button
        type='button'
        onClick={onGenerate}
        className='w-full'
        disabled={(isAllVsAll || isElimination) && !validConfig}
      >
        <Wand2 className='w-5 h-5' />
        {fixtureGenerated ? 'Regenerar fixture' : 'Generar fixture'}
      </Button>

      {fixtureError && (
        <div className='p-3 bg-destructive/10 border border-destructive/30 rounded-lg'>
          <p className='text-sm text-destructive'>{fixtureError}</p>
        </div>
      )}
    </>
  )
}

function ValidSummary({
  useZoneMode,
  hasMultipleZones,
  zoneValidations,
  zoneInputs,
  interzonalPairing,
  isElimination,
  totalDates,
  rounds,
  teamCount,
  freeDates,
  interzonalDates
}: {
  useZoneMode: boolean
  hasMultipleZones: boolean
  zoneValidations: ZoneValidation[]
  zoneInputs: ZoneInput[]
  interzonalPairing: InterzonalPairingValidation
  isElimination: boolean
  totalDates: number
  rounds: 'single' | 'double'
  teamCount: number
  freeDates: number
  interzonalDates: number
}) {
  return (
    <div className='space-y-1'>
      {useZoneMode ? (
        <>
          {zoneValidations.map((zv) => {
            const z = zoneInputs.find((x) => x.id === zv.zoneId)
            const free = z?.freeDates ?? 0
            const iz = z?.interzonalDates ?? 0
            return (
              <p key={zv.zoneId} className='text-sm'>
                <strong>
                  {zv.zoneName}: {zv.teamCount} equipos + {free} libre
                  {hasMultipleZones && iz > 0 && ` + ${iz} interzonal`} ={' '}
                  {zv.totalParticipants} participantes
                </strong>
              </p>
            )
          })}
          <p className='text-sm text-muted-foreground'>
            {isElimination ? (
              <>
                Configuración válida para eliminación directa por zona.
                {hasMultipleZones &&
                  zoneInputs.some((z) => z.interzonalDates > 0) &&
                  ' Los partidos interzonales cruzan equipos entre zonas.'}
              </>
            ) : (
              <>
                Cada zona tendrá hasta{' '}
                <strong className='text-foreground'>
                  {totalDates} fechas
                </strong>{' '}
                ({rounds === 'double' ? 'ida y vuelta' : 'solo ida'}).
                {hasMultipleZones &&
                  zoneInputs.some((z) => z.interzonalDates > 0) &&
                  ' Los partidos interzonales cruzan equipos entre zonas.'}
              </>
            )}
          </p>
        </>
      ) : (
        <>
          <p className='text-sm'>
            <strong>
              {teamCount} equipos + {freeDates} libre + {interzonalDates}{' '}
              interzonal = {teamCount + freeDates + interzonalDates}{' '}
              participantes
            </strong>
          </p>
          <p className='text-sm text-muted-foreground'>
            {isElimination ? (
              <>Configuración válida para eliminación directa.</>
            ) : (
              <>
                El torneo tendrá{' '}
                <strong className='text-foreground'>
                  {totalDates} jornadas
                </strong>{' '}
                ({rounds === 'double' ? 'ida y vuelta' : 'solo ida'}).
              </>
            )}
          </p>
        </>
      )}
      {!useZoneMode && freeDates > 0 && (
        <p className='text-xs text-muted-foreground flex items-center gap-1'>
          <Info className='w-3 h-3 shrink-0' />
          Cada equipo descansa {freeDates} jornada
          {freeDates !== 1 ? 's' : ''}.
        </p>
      )}
      {!useZoneMode && interzonalDates > 0 && (
        <p className='text-xs text-muted-foreground flex items-center gap-1'>
          <Info className='w-3 h-3 shrink-0' />
          Cada equipo juega {interzonalDates} jornada
          {interzonalDates !== 1 ? 's' : ''} interzonal.
        </p>
      )}
      {useZoneMode &&
        hasMultipleZones &&
        zoneInputs.some((z) => z.interzonalDates > 0) &&
        interzonalPairing.isValid && (
          <p className='text-xs text-muted-foreground flex items-center gap-1'>
            <Info className='w-3 h-3 shrink-0' />
            Todas las zonas tienen la misma cantidad interzonal: emparejamiento
            correcto.
          </p>
        )}
    </div>
  )
}

function InvalidSummary({
  useZoneMode,
  isElimination,
  zoneValidations,
  interzonalPairing,
  teamCount,
  freeDates,
  interzonalDates
}: {
  useZoneMode: boolean
  isElimination: boolean
  zoneValidations: ZoneValidation[]
  interzonalPairing: InterzonalPairingValidation
  teamCount: number
  freeDates: number
  interzonalDates: number
}) {
  return (
    <div className='flex items-start gap-2'>
      <AlertTriangle className='w-4 h-4 text-destructive shrink-0 mt-0.5' />
      <div>
        <p className='text-sm font-medium text-destructive'>
          {isElimination
            ? 'La cantidad total de participantes debe ser potencia de 2 (2, 4, 8, 16...) en cada zona'
            : 'La cantidad total de participantes debe ser par en cada zona'}
        </p>
        <p className='text-xs text-destructive/80 mt-0.5'>
          {useZoneMode
            ? !interzonalPairing.isValid
              ? interzonalPairing.message
              : zoneValidations
                    .filter((v) => !v.isValid)
                    .map((v) => {
                      const bad = isElimination
                        ? 'no es potencia de 2'
                        : 'impar'
                      return `${v.zoneName}: ${v.teamCount} + ${v.totalParticipants - v.teamCount} = ${v.totalParticipants} (${bad}). `
                    })
                    .join(' ') || 'Ajustá libre o interzonal por zona.'
            : `Actualmente: ${teamCount} equipos + ${freeDates} libre + ${interzonalDates} interzonal = ${teamCount + freeDates + interzonalDates} (${isElimination ? 'no es potencia de 2' : 'impar'}). Ajustá la cantidad de fechas libre o interzonal.`}
        </p>
      </div>
    </div>
  )
}

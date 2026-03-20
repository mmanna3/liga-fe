import type { FixtureAlgoritmoDTO } from '@/api/clients'
import { Button } from '@/design-system/base-ui/button'
import { Card, CardContent } from '@/design-system/base-ui/card'
import Icono from '@/design-system/ykn-ui/icono'

interface FixtureAlgoritmosDisponiblesParaGenerarProps {
  algoritmos: FixtureAlgoritmoDTO[]
  cantidadEquipos: number
  tieneAlgoritmoConfigurado: boolean
  algoritmoSeleccionado: FixtureAlgoritmoDTO | undefined
  onGenerarFixture: () => void
}

export function FixtureAlgoritmosDisponiblesParaGenerar({
  algoritmos,
  cantidadEquipos,
  tieneAlgoritmoConfigurado,
  algoritmoSeleccionado,
  onGenerarFixture
}: FixtureAlgoritmosDisponiblesParaGenerarProps) {
  return (
    <Card className='min-w-0 flex flex-col'>
      <CardContent className='pt-6'>
        <p className='text-sm text-muted-foreground mb-4'>
          Algoritmos de fixture disponibles:{' '}
          {algoritmos.map((a: FixtureAlgoritmoDTO) => (
            <span key={a.id ?? a.cantidadDeEquipos}>
              <span
                className={
                  a.cantidadDeEquipos === cantidadEquipos
                    ? 'py-1 px-2 rounded-md mx-1 bg-primary text-primary-foreground'
                    : 'py-1 px-2 rounded-md bg-muted-foreground/10 mx-1 text-muted-foreground'
                }
              >
                {a.cantidadDeEquipos}
              </span>
            </span>
          ))}
        </p>
        <div className='flex items-center gap-4'>
          <Button
            disabled={!tieneAlgoritmoConfigurado}
            onClick={onGenerarFixture}
          >
            Generar vista previa del fixture
          </Button>
          {algoritmoSeleccionado != null && !tieneAlgoritmoConfigurado && (
            <p className='text-sm text-muted-foreground'>
              El fixture para esta cantidad de equipos no está configurado.
              Configuralo desde el menú{' '}
              <span className='inline-flex items-center gap-1'>
                <Icono nombre='Configuracion' className='size-4' />
                Configuración
              </span>
              .
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

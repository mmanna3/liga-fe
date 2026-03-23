import type { FixtureAlgoritmoDTO } from '@/api/clients'
import { Button } from '@/design-system/base-ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/design-system/base-ui/card'
import Icono from '@/design-system/ykn-ui/icono'
import Link from '@/design-system/ykn-ui/link'
import SelectorSimple, {
  type OpcionSelector
} from '@/design-system/ykn-ui/selector-simple'
import { rutasNavegacion } from '@/ruteo/rutas'

interface FixtureAlgoritmosDisponiblesParaGenerarProps {
  algoritmos: FixtureAlgoritmoDTO[]
  cantidadEquipos: number
  algoritmoSeleccionado: FixtureAlgoritmoDTO | undefined
  onAlgoritmoSeleccionadoChange: (algo: FixtureAlgoritmoDTO | undefined) => void
  onGenerarFixture: () => void
}

export function FixtureAlgoritmosDisponiblesParaGenerar({
  algoritmos,
  cantidadEquipos,
  algoritmoSeleccionado,
  onAlgoritmoSeleccionadoChange,
  onGenerarFixture
}: FixtureAlgoritmosDisponiblesParaGenerarProps) {
  const algoritmosParaCantidad = algoritmos.filter(
    (a) => a.cantidadDeEquipos === cantidadEquipos
  )
  const hayAlgoritmosParaCantidad = algoritmosParaCantidad.length > 0
  const tieneAlgoritmoConfigurado =
    (algoritmoSeleccionado?.fechas?.length ?? 0) > 0

  const opciones: OpcionSelector[] = algoritmosParaCantidad.map((a) => ({
    id: String(a.id ?? a.fixtureAlgoritmoId),
    titulo: `${a.cantidadDeEquipos} equipos - ${a.nombre ?? ''}`
  }))

  return (
    <Card className='min-w-0 flex flex-col'>
      <CardHeader>
        <CardTitle className='text-base'>
          Algoritmos de fixture disponibles
        </CardTitle>
      </CardHeader>
      <CardContent className='pt-0'>
        {!hayAlgoritmosParaCantidad ? (
          <>
            <p className='text-sm text-muted-foreground mb-4'>
              No existen algoritmos para esta cantidad de equipos
            </p>
            <Button disabled>Generar vista previa del fixture</Button>
          </>
        ) : (
          <>
            <p className='text-sm text-muted-foreground mb-4'>
              Algoritmos para esta cantidad de equipos
            </p>
            <SelectorSimple
              opciones={opciones}
              valorActual={
                algoritmoSeleccionado != null
                  ? String(
                      algoritmoSeleccionado.id ??
                        algoritmoSeleccionado.fixtureAlgoritmoId
                    )
                  : ''
              }
              alElegirOpcion={(id) => {
                const algo = algoritmosParaCantidad.find(
                  (a) => String(a.id ?? a.fixtureAlgoritmoId) === id
                )
                onAlgoritmoSeleccionadoChange(algo)
              }}
              className='mb-4'
            />
            <Button
              disabled={!tieneAlgoritmoConfigurado}
              onClick={onGenerarFixture}
            >
              Generar vista previa del fixture
            </Button>
            {algoritmoSeleccionado != null && !tieneAlgoritmoConfigurado && (
              <p className='text-sm text-muted-foreground mt-3'>
                El fixture para esta cantidad de equipos no está configurado.
                Configuralo desde el menú{' '}
                <Link
                  to={rutasNavegacion.generacionDeFixtures}
                  className='inline-flex items-center gap-1'
                >
                  <Icono nombre='Configuracion' className='size-4' />
                  Configuración
                </Link>
                .
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

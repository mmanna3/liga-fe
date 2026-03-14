import { api } from '@/api/api'
import type { FixtureAlgoritmoDTO } from '@/api/clients'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/design-system/base-ui/card'
import FlujoHomeLayout from '@/design-system/ykn-ui/flujo-home-layout'
import MensajeListaVacia from '@/design-system/ykn-ui/mensaje-lista-vacia'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useQuery } from '@tanstack/react-query'

export default function GeneracionDeFixtures() {
  const { data: algoritmos = [], isLoading } = useQuery({
    queryKey: ['fixtureAlgoritmoAll'],
    queryFn: () => api.fixtureAlgoritmoAll()
  })

  const contenido = isLoading ? (
    <p className='text-sm text-muted-foreground italic text-center py-4'>
      Cargando…
    </p>
  ) : algoritmos.length === 0 ? (
    <MensajeListaVacia mensaje='No hay algoritmos de fixture configurados.' />
  ) : (
    <div className='grid grid-cols-2 gap-4 py-6'>
      {algoritmos.map((algo: FixtureAlgoritmoDTO) => (
        <Card key={algo.id ?? algo.fixtureAlgoritmoId}>
          <CardHeader>
            <CardTitle>{algo.cantidadDeEquipos} equipos</CardTitle>
            <CardDescription>
              Algoritmo de generación de fixture para {algo.cantidadDeEquipos}{' '}
              equipos.
            </CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  )

  return (
    <FlujoHomeLayout
      titulo='Generación de fixture'
      iconoTitulo='Fixture'
      pathBotonVolver={rutasNavegacion.configuracion}
      contenidoEnCard={false}
      contenido={contenido}
    />
  )
}

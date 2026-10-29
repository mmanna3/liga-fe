import { api } from '@/api/api'
import { AprobarArbitroDTO } from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import useApiQuery from '@/api/hooks/use-api-query'
import { Card, CardContent, CardHeader } from '@/design-system/base-ui/card'
import { ContenedorCargandoYError } from '@/design-system/cargando-y-error-contenedor'
import { Boton } from '@/design-system/ykn-ui/boton'
import { BotonEliminar } from '@/design-system/ykn-ui/boton-eliminar'
import BotonVolver from '@/design-system/ykn-ui/boton-volver'
import CampoLectura from '@/design-system/ykn-ui/campo-lectura'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import SelectorAgrupadoresMultiples from './components/selector-agrupadores-multiples'
import SelectorEquiposProhibidos from './components/selector-equipos-prohibidos'
import {
  textoFecha,
  textoRelacionInstitucional,
  textosFranjasHorarias,
  textoTipoMovilidad
} from './utilidades-datos-arbitro'

export default function AprobarRechazarArbitro() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id } = useParams<{ id: string }>()
  const [torneoAgrupadorIds, setTorneoAgrupadorIds] = useState<number[]>([])
  const [equipoProhibidoIds, setEquipoProhibidoIds] = useState<number[]>([])

  const {
    data: arbitro,
    isError,
    isLoading
  } = useApiQuery({
    key: ['arbitro', id],
    fn: async () => await api.arbitroGET(Number(id))
  })

  useEffect(() => {
    if (arbitro) setTorneoAgrupadorIds(arbitro.torneoAgrupadorIds ?? [])
  }, [arbitro])

  const volverALaLista = () => {
    void queryClient.invalidateQueries({ queryKey: ['arbitrosPendientes'] })
    void queryClient.invalidateQueries({ queryKey: ['arbitros'] })
    void queryClient.invalidateQueries({ queryKey: ['arbitro', id] })
    navigate(rutasNavegacion.arbitrosPendientes)
  }

  const aprobarMutation = useApiMutation({
    fn: async (dto: AprobarArbitroDTO) => {
      await api.aprobarArbitro(Number(id), dto)
    },
    antesDeMensajeExito: volverALaLista,
    mensajeDeExito: 'Árbitro aprobado'
  })

  const rechazarMutation = useApiMutation({
    fn: async (arbitroId: number) => {
      await api.arbitroDELETE(arbitroId)
    },
    antesDeMensajeExito: volverALaLista,
    mensajeDeExito: 'Árbitro rechazado'
  })

  const estaProcesando = aprobarMutation.isPending || rechazarMutation.isPending
  const franjas = textosFranjasHorarias(arbitro?.franjasHorarias)

  return (
    <ContenedorCargandoYError
      estaCargando={isLoading}
      hayError={isError}
      mensajeDeError='No se pudieron recuperar los datos del árbitro'
    >
      <div className='mb-4'>
        <BotonVolver path={rutasNavegacion.arbitrosPendientes} />
      </div>
      {arbitro && (
        <Card className='max-w-3xl mx-auto mt-10 p-6 rounded-xl border bg-white'>
          <CardHeader className='flex flex-col items-center text-center'>
            <h1 className='text-2xl font-semibold'>
              {arbitro.nombre} {arbitro.apellido}
            </h1>
            <p className='text-muted-foreground'>DNI {arbitro.dni}</p>
          </CardHeader>

          <CardContent className='space-y-8'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <CampoLectura
                titulo='Teléfono celular'
                valor={arbitro.telefonoCelular?.trim() || '—'}
              />
              <CampoLectura
                titulo='Fecha de nacimiento'
                valor={textoFecha(arbitro.fechaNacimiento)}
              />
              <CampoLectura
                titulo='Dirección'
                valor={arbitro.direccion?.trim() || '—'}
              />
              <CampoLectura
                titulo='Localidad'
                valor={arbitro.localidad?.trim() || '—'}
              />
              <CampoLectura
                titulo='Movilidad'
                valor={textoTipoMovilidad(arbitro.tipoMovilidad)}
              />
              <CampoLectura
                titulo='Relación institucional'
                valor={textoRelacionInstitucional(
                  arbitro.tieneRelacionInstitucional,
                  arbitro.institucion
                )}
              />
              <div className='md:col-span-2'>
                <CampoLectura
                  titulo='Franjas horarias'
                  valor={
                    franjas.length > 0 ? (
                      <ul className='list-disc pl-5'>
                        {franjas.map((franja) => (
                          <li key={franja}>{franja}</li>
                        ))}
                      </ul>
                    ) : (
                      '—'
                    )
                  }
                />
              </div>
            </div>

            <SelectorAgrupadoresMultiples
              valor={torneoAgrupadorIds}
              alCambiar={setTorneoAgrupadorIds}
              deshabilitado={estaProcesando}
            />
            <SelectorEquiposProhibidos
              valor={equipoProhibidoIds}
              alCambiar={setEquipoProhibidoIds}
              deshabilitado={estaProcesando}
            />

            <div className='flex gap-6'>
              <Boton
                variant='default'
                className='w-full'
                estaCargando={estaProcesando}
                onClick={() =>
                  aprobarMutation.mutate(
                    new AprobarArbitroDTO({
                      torneoAgrupadorIds,
                      equipoProhibidoIds
                    })
                  )
                }
              >
                Aprobar
              </Boton>

              <BotonEliminar
                titulo='¿Rechazar a este árbitro?'
                subtitulo='Se borra la solicitud con todos sus datos. Si quiere volver a anotarse, tiene que registrarse de nuevo desde la app.'
                eliminarTexto='Rechazar definitivamente'
                onEliminar={() => rechazarMutation.mutate(arbitro.id!)}
                estaCargando={estaProcesando}
                trigger={
                  <Boton
                    variant='destructive'
                    className='w-full'
                    estaCargando={estaProcesando}
                  >
                    Rechazar
                  </Boton>
                }
              />
            </div>
          </CardContent>
        </Card>
      )}
    </ContenedorCargandoYError>
  )
}

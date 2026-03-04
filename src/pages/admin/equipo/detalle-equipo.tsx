import { api } from '@/api/api'
import useApiMutation from '@/api/custom-hooks/use-api-mutation'
import useApiQuery from '@/api/custom-hooks/use-api-query'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ModalEliminacion from '@/components/modal-eliminacion'
import { VisibleSoloParaAdmin } from '@/components/visible-solo-para-admin'
import { Skeleton } from '@/components/ui/skeleton'
import { Boton } from '@/components/ykn-ui/boton'
import BotonVolver from '@/components/ykn-ui/boton-volver'
import Botonera from '@/components/ykn-ui/botonera'
import DetalleItem from '@/components/ykn-ui/detalle-item'
import JugadorEquipoEstadoBadge from '@/components/ykn-ui/jugador-equipo-estado-badge'
import { generarReportePDF } from '@/pages/admin/equipo/components/reporte-jugadores-pdf'
import { rutasNavegacion } from '@/routes/rutas'
import { useQuery } from '@tanstack/react-query'
import { FileDown, Pencil, Trash2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

export default function DetalleEquipo() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const {
    data: equipo,
    isError,
    isLoading
  } = useApiQuery({
    key: ['equipo', id],
    fn: async () => await api.equipoGET(Number(id))
  })

  const { data: jugadoresExclusivos, isLoading: isLoadingJugadoresExclusivos } =
    useQuery({
      queryKey: ['jugadores-equipo-exclusivos', id],
      queryFn: () => api.jugadoresQueSoloJueganEnEsteEquipo(Number(id)),
      enabled: !!equipo
    })

  const eliminarMutation = useApiMutation<void>({
    fn: async () => {
      await api.equipoDELETE(Number(id))
    },
    antesDeMensajeExito: () =>
      navigate(
        equipo?.clubId
          ? `${rutasNavegacion.detalleClub}/${equipo.clubId}`
          : rutasNavegacion.equipos
      ),
    mensajeDeExito: `El equipo '${equipo?.nombre}' fue eliminado.`
  })

  const handleGenerarReportePDF = async () => {
    if (equipo) {
      await generarReportePDF(equipo)
    }
  }

  const listaJugadoresExclusivos = isLoadingJugadoresExclusivos
    ? 'Cargando...'
    : jugadoresExclusivos && jugadoresExclusivos.length > 0
      ? jugadoresExclusivos.map((j) => `${j.nombre} ${j.apellido}`).join(', ')
      : 'Ninguno'

  if (isError) {
    return (
      <Alert variant='destructive' className='mb-4'>
        <AlertTitle className='text-xl font-semibold'>Error</AlertTitle>
        <AlertDescription>
          No se pudieron recuperar los datos del equipo.
        </AlertDescription>
      </Alert>
    )
  }

  if (isLoading) {
    return (
      <div className='max-w-md mx-auto mt-10'>
        <Skeleton className='h-16 w-64' />
        <Skeleton className='h-8 w-64 my-3' />
        <Skeleton className='h-8 w-64 my-3' />
        <Skeleton className='h-8 w-64 my-3' />
      </div>
    )
  }

  return (
    <Card className='max-w-2lg mx-auto mt-10 p-4'>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle>{equipo!.nombre}</CardTitle>
        <div className='flex gap-2'>
          <Boton
            variant='outline'
            className='group h-10 w-10 min-w-10 gap-0 overflow-hidden px-0 transition-[width,gap,padding] duration-200 hover:w-auto hover:min-w-40 hover:gap-2 hover:px-3'
            onClick={handleGenerarReportePDF}
          >
            <FileDown className='h-5 w-5 shrink-0' />
            <span className='max-w-0 overflow-hidden whitespace-nowrap transition-[max-width] duration-200 group-hover:max-w-40'>
              Generar Reporte PDF
            </span>
          </Boton>
          <VisibleSoloParaAdmin>
            <Boton
              variant='outline'
              className='group h-10 w-10 min-w-10 gap-0 overflow-hidden px-0 transition-[width,gap,padding] duration-200 hover:w-auto hover:min-w-24 hover:gap-2 hover:px-3'
              onClick={() =>
                navigate(`${rutasNavegacion.editarEquipo}/${equipo!.id}`)
              }
            >
              <Pencil className='h-5 w-5 shrink-0' />
              <span className='max-w-0 overflow-hidden whitespace-nowrap transition-[max-width] duration-200 group-hover:max-w-20'>
                Editar
              </span>
            </Boton>
            <ModalEliminacion
              titulo={`Eliminar definitivamente al equipo ${equipo!.nombre}`}
              subtitulo={`Al eliminar el equipo, se eliminarán también los jugadores que solo jueguen en este equipo. Son: ${listaJugadoresExclusivos}`}
              eliminarOnClick={() => eliminarMutation.mutate(undefined)}
              eliminarTexto='Eliminar definitivamente equipo y jugadores'
              trigger={
                <Boton
                  variant='destructive'
                  className='group h-10 w-10 min-w-10 gap-0 overflow-hidden px-0 transition-[width,gap,padding] duration-200 hover:w-auto hover:min-w-32 hover:gap-2 hover:px-3'
                  estaCargando={eliminarMutation.isPending}
                >
                  <Trash2 className='h-5 w-5 shrink-0' />
                  <span className='max-w-0 overflow-hidden whitespace-nowrap transition-[max-width] duration-200 group-hover:max-w-32'>
                    Eliminar equipo
                  </span>
                </Boton>
              }
              estaCargando={eliminarMutation.isPending}
            />
          </VisibleSoloParaAdmin>
        </div>
      </CardHeader>
      <CardContent>
        <div className='mb-4 space-y-2'>
          <DetalleItem clave='Club' valor={equipo!.clubNombre!} />
          <DetalleItem
            clave='Torneo'
            valor={equipo!.torneoNombre || 'No asignado'}
          />
          <DetalleItem clave='Código' valor={equipo!.codigoAlfanumerico!} />
        </div>
        <h2 className='text-md font-bold'>Jugadores</h2>
        <ul className='list-disc list-inside'>
          {equipo!.jugadores!.map((jug) => (
            <li key={jug.id} className='my-1'>
              {jug.nombre} {jug.apellido} - {jug.dni}{' '}
              <span className='ml-2'>
                <JugadorEquipoEstadoBadge estado={Number(jug.estado)} />
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
      <Botonera>
        <BotonVolver texto='Volver' />
      </Botonera>
    </Card>
  )
}

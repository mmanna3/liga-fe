import { JugadorConAmarillasDTO } from '@/api/clients'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/design-system/base-ui/dialog'
import { ContenedorCargandoYError } from '@/design-system/cargando-y-error-contenedor'
import { Boton } from '@/design-system/ykn-ui/boton'
import LayoutSegundoNivel from '@/design-system/ykn-ui/layout-segundo-nivel'
import MensajeListaVacia from '@/design-system/ykn-ui/mensaje-lista-vacia'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAmarillasTorneo } from './hooks/use-amarillas-torneo'

type EquipoConJugadores = {
  equipoId: number
  nombreEquipo: string
  jugadores: JugadorConAmarillasDTO[]
}

type ClubConEquipos = {
  clubId: number
  nombreClub: string
  equipos: EquipoConJugadores[]
}

/** Agrupa la lista (ya viene ordenada por club, equipo y apellido desde el back). */
function agruparPorClubYEquipo(
  jugadores: JugadorConAmarillasDTO[]
): ClubConEquipos[] {
  const clubes: ClubConEquipos[] = []

  for (const jugador of jugadores) {
    let club = clubes.find((c) => c.clubId === jugador.clubId)
    if (!club) {
      club = {
        clubId: jugador.clubId ?? 0,
        nombreClub: jugador.nombreClub ?? '—',
        equipos: []
      }
      clubes.push(club)
    }

    let equipo = club.equipos.find((e) => e.equipoId === jugador.equipoId)
    if (!equipo) {
      equipo = {
        equipoId: jugador.equipoId ?? 0,
        nombreEquipo: jugador.nombreEquipo ?? '—',
        jugadores: []
      }
      club.equipos.push(equipo)
    }

    equipo.jugadores.push(jugador)
  }

  return clubes
}

export default function AmarillasTorneo() {
  const {
    torneoId,
    torneo,
    esAdmin,
    habilitado,
    cargando,
    hayError,
    jugadores,
    limpiarMutation
  } = useAmarillasTorneo()

  const [confirmarAbierto, setConfirmarAbierto] = useState(false)

  const volverAlDetalle = `${rutasNavegacion.detalleTorneo}/${torneoId}`
  const cantidad = jugadores.length

  const contenido = !habilitado ? (
    <div className='space-y-4'>
      <p className='text-sm text-muted-foreground'>
        {!esAdmin
          ? 'Esta pantalla solo está disponible para administradores.'
          : 'Este torneo no tiene habilitada la limpieza de tarjetas amarillas.'}
      </p>
      <Boton asChild variant='outline'>
        <Link to={volverAlDetalle}>Volver al torneo</Link>
      </Boton>
    </div>
  ) : (
    <div className='space-y-6'>
      {cantidad === 0 ? (
        <MensajeListaVacia mensaje='No hay jugadores con tarjetas amarillas en este torneo.' />
      ) : (
        <div className='space-y-6'>
          {agruparPorClubYEquipo(jugadores).map((club) => (
            <div key={club.clubId} className='space-y-3'>
              <h3 className='text-lg font-semibold text-gray-900'>
                {club.nombreClub}
              </h3>
              {club.equipos.map((equipo) => (
                <div key={equipo.equipoId} className='space-y-1'>
                  <p className='text-sm font-semibold text-muted-foreground'>
                    {equipo.nombreEquipo}
                  </p>
                  <ul className='divide-y divide-gray-100 rounded-md border'>
                    {equipo.jugadores.map((jugador) => (
                      <li
                        key={jugador.jugadorEquipoId}
                        className='flex items-center justify-between px-3 py-2'
                      >
                        <span className='font-medium'>
                          {jugador.nombreCompleto}
                          <span className='ml-2 text-sm text-muted-foreground'>
                            DNI {jugador.dni}
                          </span>
                        </span>
                        <span className='shrink-0 rounded-full bg-yellow-100 px-2 py-0.5 text-sm font-semibold text-yellow-800'>
                          {jugador.tarjetasAmarillas}{' '}
                          {jugador.tarjetasAmarillas === 1
                            ? 'amarilla'
                            : 'amarillas'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <div className='flex justify-end border-t pt-4'>
        <Boton
          variant='destructive'
          disabled={cantidad === 0 || limpiarMutation.isPending}
          onClick={() => setConfirmarAbierto(true)}
        >
          Borrar todas las amarillas de este torneo
        </Boton>
      </div>

      <Dialog open={confirmarAbierto} onOpenChange={setConfirmarAbierto}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Borrar todas las amarillas</DialogTitle>
            <DialogDescription>
              Se pondrán en cero las tarjetas amarillas de {cantidad}{' '}
              {cantidad === 1 ? 'jugador' : 'jugadores'} de este torneo. Las
              tarjetas rojas no se modifican. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Boton
              variant='outline'
              type='button'
              onClick={() => setConfirmarAbierto(false)}
            >
              Cancelar
            </Boton>
            <Boton
              variant='destructive'
              estaCargando={limpiarMutation.isPending}
              onClick={() =>
                limpiarMutation.mutate(undefined, {
                  onSuccess: () => setConfirmarAbierto(false)
                })
              }
            >
              Borrar amarillas
            </Boton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )

  return (
    <ContenedorCargandoYError
      estaCargando={cargando}
      hayError={hayError}
      mensajeDeError='No se pudieron recuperar los jugadores con tarjetas amarillas'
    >
      <LayoutSegundoNivel
        titulo='Tarjetas amarillas'
        subtitulo={torneo?.nombre}
        iconoTitulo='Torneos'
        pathBotonVolver={volverAlDetalle}
        maxWidth='3xl'
        contenido={contenido}
      />
    </ContenedorCargandoYError>
  )
}

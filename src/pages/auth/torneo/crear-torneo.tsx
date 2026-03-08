import { api } from '@/api/api'
import { TorneoDTO } from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import { Button } from '@/ui/base-ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/base-ui/card'
import { Input } from '@/ui/base-ui/input'
import BotonVolver from '@/ui/ykn-ui/boton-volver'
import ContenedorBotones from '@/ui/ykn-ui/contenedor-botones'
import { rutasNavegacion } from '@/routes/rutas'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CrearTorneo() {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState<string>('')

  const mutation = useApiMutation({
    fn: async (nuevoTorneo: TorneoDTO) => {
      await api.torneoPOST(nuevoTorneo)
    },
    antesDeMensajeExito: () => navigate(rutasNavegacion.torneos),
    mensajeDeExito: `Torneo '${nombre}' creado correctamente`
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    mutation.mutate(new TorneoDTO({ nombre }))
  }

  return (
    <>
      <div className='mb-4'>
        <BotonVolver />
      </div>
      <Card className='max-w-md mx-auto p-4'>
        <CardHeader>
          <CardTitle>Crear Torneo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <Input
              type='text'
              placeholder='Nombre'
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
            <ContenedorBotones>
              <Button type='submit' disabled={mutation.isPending}>
                {mutation.isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </ContenedorBotones>
          </form>
        </CardContent>
      </Card>
    </>
  )
}

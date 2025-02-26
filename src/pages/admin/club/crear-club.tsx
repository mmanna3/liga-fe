import { api } from '@/api/api'
import { ClubDTO } from '@/api/clients'
import useApiMutation from '@/api/custom-hooks/use-api-mutation'
import Botonera from '@/components/ui/botonera'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import BotonVolver from '@/components/ykn-ui/boton-volver'
import { rutasNavegacion } from '@/routes/rutas'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CrearClub() {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const mutation = useApiMutation({
    fn: async (nuevoClub: ClubDTO) => {
      await api.clubPOST(nuevoClub)
    },
    antesDeMensajeExito: () => navigate(rutasNavegacion.clubs),
    mensajeDeExito: `Club '${nombre}' creado correctamente`
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    mutation.mutate(new ClubDTO({ nombre }))
  }

  return (
    <Card className='max-w-md mx-auto mt-10 p-4'>
      <CardHeader>
        <CardTitle>Crear Club</CardTitle>
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
          {error && <p className='text-red-500 text-sm'>{error}</p>}
          <Botonera>
            <BotonVolver texto='Cancelar' />
            <Button type='submit' disabled={mutation.isPending}>
              {mutation.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </Botonera>
        </form>
      </CardContent>
    </Card>
  )
}

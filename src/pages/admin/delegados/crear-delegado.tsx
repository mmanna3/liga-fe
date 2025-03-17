import { api } from '@/api/api'
import { DelegadoDTO } from '@/api/clients'
import useApiMutation from '@/api/custom-hooks/use-api-mutation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import BotonVolver from '@/components/ykn-ui/boton-volver'
import Botonera from '@/components/ykn-ui/botonera'
import { rutasNavegacion } from '@/routes/rutas'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ComboboxClub } from './components/combobox-club'

export default function CrearDelegado() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState('')
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [clubId, setClubId] = useState<number | null>(null)

  const mutation = useApiMutation({
    fn: async (nuevoDelegado: DelegadoDTO) => {
      await api.delegadoPOST(nuevoDelegado)
    },
    antesDeMensajeExito: () => navigate(rutasNavegacion.delegados),
    mensajeDeExito: `Delegado '${nombre}' creado correctamente`
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!clubId) return
    mutation.mutate(
      new DelegadoDTO({
        usuario,
        nombre,
        apellido,
        clubId
      })
    )
  }

  return (
    <Card className='max-w-md mx-auto mt-10 p-4'>
      <CardHeader>
        <CardTitle>Crear Delegado</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <Input
            type='text'
            placeholder='Usuario'
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
          />
          <Input
            type='text'
            placeholder='Nombre'
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <Input
            type='text'
            placeholder='Apellido'
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            required
          />
          <ComboboxClub
            value={clubId}
            onChange={setClubId}
            required
          />
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
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { BASE_URL } from '@/consts'
import { rutasNavegacion } from '@/routes/rutas'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface Club {
  nombre: string
}

export default function CrearClub() {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation<Club, Error, Club>({
    mutationFn: async (newClub: Club) => {
      const response = await fetch(`${BASE_URL}/club`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClub)
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al crear el club')
      }
      return response.json()
    },
    onSuccess: () => {
      setError(null)
      navigate(rutasNavegacion.clubs)
    },
    onError: (err) => {
      setError(err.message)
    }
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    mutation.mutate({ nombre })
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
          <div className='flex justify-end space-x-2'>
            <Button
              variant='outline'
              type='button'
              onClick={() => navigate(-1)}
            >
              Cancelar
            </Button>
            <Button type='submit' disabled={mutation.isPending}>
              {mutation.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

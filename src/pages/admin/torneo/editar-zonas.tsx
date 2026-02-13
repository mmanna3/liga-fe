import { Button } from '@/components/ui/button'
import { rutasNavegacion } from '@/routes/rutas'
import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'

export default function EditarZonasPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Button
          variant='ghost'
          size='icon'
          onClick={() =>
            navigate(`${rutasNavegacion.torneosInformacion}/${id}`)
          }
        >
          <ArrowLeft className='h-4 w-4' />
        </Button>
        <h1 className='text-2xl font-semibold'>Editar zonas</h1>
      </div>
      <p className='text-muted-foreground'>
        Pantalla de edición de zonas (próximamente).
      </p>
    </div>
  )
}

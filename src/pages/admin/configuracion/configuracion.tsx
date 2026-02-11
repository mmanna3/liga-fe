import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { usePaletaColores, type PaletaId } from '@/hooks/use-paleta-colores'
import { Palette } from 'lucide-react'

const opcionesPaleta: { id: PaletaId; label: string; bg: string }[] = [
  { id: 'negro', label: 'Negro', bg: 'bg-zinc-800' },
  { id: 'azul', label: 'Azul', bg: 'bg-blue-600' },
  { id: 'verde', label: 'Verde', bg: 'bg-green-600' },
  { id: 'rojo', label: 'Rojo', bg: 'bg-red-600' }
]

export default function Configuracion() {
  const { paleta, setPaleta } = usePaletaColores()

  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-bold'>Configuración</h1>
      <Card>
        <CardHeader className='bg-slate-50'>
          <CardTitle className='flex items-center gap-2'>
            <Palette className='h-5 w-5' />
            Paleta de colores
          </CardTitle>
          <CardDescription>
            Cambia el color principal de la aplicación
          </CardDescription>
        </CardHeader>
        <CardContent className='p-6'>
          <div className='flex gap-4'>
            {opcionesPaleta.map((p) => (
              <button
                key={p.id}
                type='button'
                onClick={() => setPaleta(p.id)}
                className={cn(
                  'flex flex-col items-center gap-2 p-3 rounded-lg transition-all',
                  paleta === p.id
                    ? 'bg-muted ring-2 ring-primary'
                    : 'hover:bg-muted/50'
                )}
              >
                <div
                  className={cn('w-10 h-10 rounded-full', p.bg)}
                />
                <span className='text-sm font-medium'>{p.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

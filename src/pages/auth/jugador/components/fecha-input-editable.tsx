import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface IProps {
  fechaInicial: Date
  onChange: (fecha: Date) => void
}

export default function InputFecha({ fechaInicial, onChange }: IProps) {
  const [day, setDay] = useState(
    fechaInicial.getDate().toString().padStart(2, '0') || ''
  )
  const [month, setMonth] = useState(
    (fechaInicial.getMonth() + 1).toString().padStart(2, '0') || ''
  )
  const [year, setYear] = useState(fechaInicial.getFullYear().toString() || '')
  const [error, setError] = useState('')

  function validarFecha() {
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))

    if (
      date.getFullYear() !== parseInt(year) ||
      date.getMonth() + 1 !== parseInt(month) ||
      date.getDate() !== parseInt(day)
    ) {
      setError('Fecha inválida')
      return false
    }
    setError('')
    return true
  }

  function handleBlur() {
    if (validarFecha()) {
      onChange(new Date(Number(year), Number(month) - 1, Number(day)))
    }
  }

  return (
    <div className='space-y-2'>
      <div className='flex gap-2'>
        <div>
          <Label htmlFor='day'>Día</Label>
          <Input
            id='day'
            type='text'
            value={day}
            onChange={(e) => setDay(e.target.value)}
            onBlur={handleBlur}
            className={cn('w-16', error && 'border-red-500')}
          />
        </div>
        <div>
          <Label htmlFor='month'>Mes</Label>
          <Input
            id='month'
            type='text'
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            onBlur={handleBlur}
            className={cn('w-16', error && 'border-red-500')}
          />
        </div>
        <div>
          <Label htmlFor='year'>Año</Label>
          <Input
            id='year'
            type='text'
            value={year}
            onChange={(e) => setYear(e.target.value)}
            onBlur={handleBlur}
            className={cn('w-24', error && 'border-red-500')}
          />
        </div>
      </div>
      {error && <p className='text-red-500 text-sm'>{error}</p>}
    </div>
  )
}

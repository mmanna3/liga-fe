import { useEffect, useState } from 'react'

const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
]

function diasEnMes(month: number): number {
  // Date.UTC(year, month+1, 0) = último día del mes en UTC
  return new Date(
    Date.UTC(new Date().getUTCFullYear(), month + 1, 0)
  ).getUTCDate()
}

const selectClass =
  'h-8 text-sm rounded-md border border-input bg-background px-2 focus:outline-none focus:ring-1 focus:ring-ring text-foreground disabled:opacity-50 disabled:cursor-not-allowed'

export function DiaMesPicker({
  dia,
  onChange
}: {
  dia: Date | undefined
  onChange: (dia: Date | undefined) => void
}) {
  // Estado local para manejar la selección intermedia (mes sin día aún).
  // Usamos métodos UTC para evitar corrimientos por zona horaria.
  const [month, setMonth] = useState<number>(dia ? dia.getUTCMonth() : -1)
  const [day, setDay] = useState<number>(dia ? dia.getUTCDate() : 0)

  // Sincronizar con cambios externos en la prop `dia`
  useEffect(() => {
    if (dia) {
      setMonth(dia.getUTCMonth())
      setDay(dia.getUTCDate())
    } else {
      setMonth(-1)
      setDay(0)
    }
  }, [dia])

  const maxDias = month >= 0 ? diasEnMes(month) : 0

  function handleMonthChange(value: string) {
    if (value === '') {
      setMonth(-1)
      setDay(0)
      onChange(undefined)
      return
    }
    const newMonth = Number(value)
    const max = diasEnMes(newMonth)
    const newDay = day > max ? 0 : day
    setMonth(newMonth)
    if (newDay !== day) setDay(newDay)
    if (newDay > 0) {
      onChange(
        new Date(Date.UTC(new Date().getUTCFullYear(), newMonth, newDay))
      )
    } else {
      onChange(undefined)
    }
  }

  function handleDayChange(value: string) {
    if (value === '') {
      setDay(0)
      onChange(undefined)
      return
    }
    const newDay = Number(value)
    setDay(newDay)
    if (month >= 0) {
      onChange(new Date(Date.UTC(new Date().getUTCFullYear(), month, newDay)))
    }
  }

  return (
    <div className='flex items-center gap-2'>
      {/* Mes */}
      <select
        className={selectClass}
        value={month >= 0 ? month : ''}
        onChange={(e) => handleMonthChange(e.target.value)}
      >
        <option value=''>Mes</option>
        {MESES.map((m, i) => (
          <option key={i} value={i}>
            {m}
          </option>
        ))}
      </select>

      {/* Día — deshabilitado hasta que se elija el mes */}
      <select
        className={selectClass}
        value={day || ''}
        disabled={month < 0}
        onChange={(e) => handleDayChange(e.target.value)}
      >
        <option value=''>Día</option>
        {Array.from({ length: maxDias }, (_, i) => i + 1).map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
    </div>
  )
}

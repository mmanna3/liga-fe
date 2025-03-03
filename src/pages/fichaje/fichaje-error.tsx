import { useSearchParams } from 'react-router-dom'

const FichajeError = () => {
  const [searchParams] = useSearchParams()
  const mensaje = searchParams.get('mensaje')

  return (
    <div className='bg-red-500 w-screen h-screen text-white p-8'>
      <div>
        <p>
          ¡Ups! Hubo un <strong>error</strong>. No se pudo fichar al jugador.
        </p>
        <p className='mt-4'>
          Volvé a intentar en un rato. Si no, comunicate con la liga con este
          código:
        </p>
        <p className='rounded-lg max-w-xl text-amber-100 mt-4 p-3 bg-slate-900'>
          {mensaje ?? '0800NDS'}
        </p>
      </div>
    </div>
  )
}

export default FichajeError

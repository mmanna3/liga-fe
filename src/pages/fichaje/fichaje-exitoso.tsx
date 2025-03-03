import { useNavigate, useSearchParams } from 'react-router-dom'

const FichajeExitoso = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const dni = searchParams.get('dni')
  const codigoEquipo = searchParams.get('codigoEquipo')

  return (
    <div className='bg-blue-500 w-screen h-screen text-white p-8'>
      <p>
        ¡Jugador de DNI: {dni} registrado correctamente! Gracias por ficharte.
      </p>
      <div className='mt-6'>
        <button
          onClick={() => navigate('/fichaje?codigoEquipo=' + codigoEquipo)}
          className='rounded-lg bg-green-700 py-3 px-3 text-center text-white'
        >
          Fichar otro jugador
        </button>
      </div>
    </div>
  )
}

export default FichajeExitoso

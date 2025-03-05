import { useLocation, useNavigate, useRouteError } from 'react-router-dom'

const ErrorPage: React.FC = () => {
  const error: unknown = useRouteError()
  const location = useLocation()
  const navigate = useNavigate()

  // Comprobamos si el error tiene los campos status y title
  const status = JSON.parse((error as { response: string }).response).status
  const title = JSON.parse((error as { response: string }).response).title

  return (
    <div className='max-w-7xl text-negro'>
      <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform text-center'>
        <div
          id='error-page'
          className='flex h-screen flex-col items-center justify-center gap-6'
        >
          <h1 className='text-4xl font-bold'>Ay!</h1>
          <p>Disculpá, hubo un error inesperado.</p>
          <p>Avisale al administrador con este código:</p>
          <p className='text-gray-500'>{location.pathname}</p>
          {/* {status === 500 && title && ( */}
          <p className='text-gray-500'> STATUS: {status}</p>
          <p className='text-gray-500'>
            <i>{title}</i> {/* Mostrar el title del error */}
          </p>
          {/* )} */}
          <button
            onClick={() => navigate(-1)}
            type='button'
            className='mt-4 rounded-xl border border-gris px-6 py-2 text-sm text-gris'
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  )
}

export default ErrorPage

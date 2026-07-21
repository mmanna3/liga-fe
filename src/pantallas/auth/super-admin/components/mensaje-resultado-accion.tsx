interface Props {
  exito?: boolean
  mensajeExito?: string
  error?: boolean
  tituloError: string
  errores: string[]
  errorObj: unknown
}

export default function MensajeResultadoAccion({
  exito,
  mensajeExito,
  error,
  tituloError,
  errores,
  errorObj
}: Props) {
  return (
    <>
      {exito && mensajeExito && (
        <p className='text-sm text-green-700 font-medium'>{mensajeExito}</p>
      )}

      {error && (
        <div className='text-sm text-destructive space-y-1'>
          <p className='font-medium'>{tituloError}</p>
          {errores.length > 0 ? (
            <ul className='list-disc list-inside space-y-0.5'>
              {errores.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          ) : (
            <p>
              {errorObj instanceof Error
                ? errorObj.message
                : 'Error desconocido'}
            </p>
          )}
        </div>
      )}
    </>
  )
}

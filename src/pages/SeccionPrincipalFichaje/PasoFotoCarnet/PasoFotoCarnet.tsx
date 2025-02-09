import { useCallback, useEffect, useState } from 'react'
import Cropper from 'react-easy-crop'
// import Slider from '@material-ui/core/Slider';
import estilos from './PasoFotoCarnet.module.css'
// import bootstrap from "GlobalStyle/bootstrap.min.css";
import { useFormContext } from 'react-hook-form'
import FormErrorHandler from '../Error/FormErrorHandler'
import ImageUploader from '../ImageUploader/ImageUploader'
import Label from '../Label/Label'
import persona from './chico.jpg'
import obtenerImagenRecortada from './recortarImagen'

const PasoFotoCarnet = () => {
  const {
    register,
    setValue,
    formState: { errors }
  } = useFormContext()

  const [imagen, setImagen] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [imagenRecortada, setImagenRecortada] = useState(persona)
  const [
    posicionDelScrollAntesDeAbrirRecortador,
    setPosicionDelScrollAntesDeAbrirRecortador
  ] = useState()

  useEffect(() => {
    alAbrirRecortadorScrolearHastaArribaYAlCerrarloVolver(imagen)
  }, [imagen])

  const alAbrirRecortadorScrolearHastaArribaYAlCerrarloVolver = (imagen) => {
    if (window.pageYOffset != 0)
      setPosicionDelScrollAntesDeAbrirRecortador(window.pageYOffset)

    if (imagen != null) window.scrollTo(0, 0)
    else window.scrollTo(0, posicionDelScrollAntesDeAbrirRecortador)
  }

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader()
      reader.addEventListener('load', () => setImagen(reader.result))
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const onAceptarClick = async () => {
    try {
      const croppedImage = await obtenerImagenRecortada(
        imagen,
        croppedAreaPixels
      )

      setImagenRecortada(croppedImage)
      setValue('fotoCarnet', croppedImage)
    } catch (e) {
      console.error(e)
    }

    setImagen(null)
  }

  const onCancelarClick = () => {
    setImagen(null)
  }

  return (
    <div>
      <div className='bg-green-700 py-6 px-3'>
        <div className={estilos.contenedorDeContenidoCentrado}>
          <Label
            texto={'Tu foto'}
            subtitulo='Tiene que tener fondo liso'
            centrado={true}
          />
        </div>

        <div className={estilos.contenedorDeContenidoCentrado}>
          <img
            src={imagenRecortada}
            alt='Cropped'
            className={estilos.imagenRecortada}
          />
        </div>

        <ImageUploader value={imagen} onChange={onSelectFile} />
        <input
          readOnly
          {...register('fotoCarnet', {
            validate: (value) =>
              value !== persona || '¡Ups! Te olvidaste tu foto.'
          })}
          style={{ display: 'none' }}
          value={imagenRecortada}
        />
        <FormErrorHandler name='fotoCarnet' errors={errors} nombre='foto' />
        {imagen && (
          <div className={estilos.contenedorGeneralDeTodo}>
            <div className={estilos.cropContainer}>
              <Cropper
                image={imagen}
                crop={crop}
                aspect={4 / 3}
                onCropChange={setCrop}
                cropSize={{ width: 360, height: 360 }}
                onCropComplete={onCropComplete}
                zoom={zoom}
                onZoomChange={(zoom) => setZoom(zoom)}
              />
            </div>
            {/* <div className={estilos.sliderContainer}>
              <Slider
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby='Zoom'
                onChange={(e, zoom) => setZoom(zoom)}
              />
            </div> */}
            <div className={estilos.botonesContainer}>
              <div className=''>
                <div className='flex justify-around'>
                  <div className=''>
                    <button
                      type='button'
                      className='rounded-lg bg-green-700 px-10 py-4 text-white md:px-20'
                      style={{ width: '100%' }}
                      onClick={onAceptarClick}
                    >
                      Aceptar
                    </button>
                  </div>
                  <div className=''>
                    <button
                      type='button'
                      className={
                        'py-auto rounded-lg bg-red-700 px-10 py-4 text-center text-white md:px-20'
                      }
                      style={{ width: '100%' }}
                      onClick={onCancelarClick}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PasoFotoCarnet

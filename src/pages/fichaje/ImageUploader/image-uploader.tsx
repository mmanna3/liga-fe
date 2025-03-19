import estilos from './ImageUploader.module.css'

interface IImageUploader {
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  'data-testid'?: string
}

const ImageUploader = ({
  onChange,
  'data-testid': dataTestId
}: IImageUploader) => {
  return (
    <div className={estilos.contenedorBotonSubir}>
      <input
        type='file'
        id='fileInput'
        accept='image/*'
        onChange={onChange}
        className={estilos.inputFile}
        data-testid={dataTestId}
      />
      <label htmlFor='fileInput' className={estilos.labelInput}>
        SUBIR FOTO
      </label>
    </div>
  )
}

export default ImageUploader

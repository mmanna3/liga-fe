import estilos from './ImageUploader.module.css'

interface IImageUploader {
  onChange?: React.ChangeEventHandler<HTMLInputElement>
}

const ImageUploader = ({ onChange }: IImageUploader) => (
  <div style={{ width: '100%' }}>
    <label style={{ width: '100%' }}>
      <div className={estilos.contenedorDeContenidoCentrado}>
        <span
          className={`py-auto rounded-lg bg-red-700 text-center text-white ${estilos.botonImageUploader}`}
        >
          SUBILA
        </span>
      </div>
      <input
        style={{ display: 'none' }}
        type='file'
        accept='image/*'
        onChange={onChange}
      />
    </label>
  </div>
)

export default ImageUploader

import styles from './Label.module.css';

interface ILabel {
  texto: string;
  subtitulo?: string;
  centrado?: boolean;
}

const Label = ({ texto, subtitulo, centrado }: ILabel) => {
  const estiloCentrado = centrado ? styles.centrado : '';

  return (
    <div className={estiloCentrado}>
      {subtitulo ? (
        <>
          <label className={styles.labelConSubtitulo}>{texto}</label>
          <p className={styles.subtitulo}>{subtitulo}</p>
        </>
      ) : (
        <label className={styles.labelSinSubtitulo}>{texto}</label>
      )}
    </div>
  );
};

export default Label;

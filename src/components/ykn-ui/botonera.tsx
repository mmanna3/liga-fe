interface Props {
  children: React.ReactNode
}

const Botonera: React.FC<Props> = ({ children }: Props) => {
  return <div className='flex justify-end space-x-2'>{children}</div>
}

export default Botonera

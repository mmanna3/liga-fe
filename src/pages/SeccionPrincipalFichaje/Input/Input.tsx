import React, { useState } from 'react'
// import bootstrap from "GlobalStyle/bootstrap.min.css";

interface IInput {
  onChange?: (value: string) => void
  name?: string
  register?: any
  type: string
  className?: string
  valorInicial?: string
}

const Input = ({
  onChange,
  name,
  register,
  type = 'text',
  className,
  valorInicial = ''
}: IInput) => {
  const [valor, setValor] = useState(valorInicial)

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) onChange(e.target.value)
    setValor(e.target.value)
  }

  return (
    <input
      {...register}
      name={name}
      className={'bg-white text-black ' + className}
      value={valor}
      type={type}
      onChange={handleOnChange}
      autoComplete='off'
    />
  )
}

export default Input

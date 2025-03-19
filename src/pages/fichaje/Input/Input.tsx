import React, { useState } from 'react'
// import bootstrap from "GlobalStyle/bootstrap.min.css";

interface IInput {
  onChange?: (value: string) => void
  name?: string
  register?: any
  type: string
  className?: string
  valorInicial?: string
  dataTestId?: string
}

const Input = ({
  onChange,
  name,
  register,
  dataTestId,
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
      data-testid={dataTestId}
      {...register}
      name={name}
      className={'bg-white p-3 text-black h-9 rounded ' + className}
      value={valor}
      type={type}
      onChange={handleOnChange}
      autoComplete='off'
    />
  )
}

export default Input

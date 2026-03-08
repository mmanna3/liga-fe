import { Link as RouterLink, type LinkProps } from 'react-router-dom'

export default function Link({ className = '', ...props }: LinkProps) {
  return (
    <RouterLink
      className={`text-blue-600 underline hover:text-blue-700 ${className}`}
      {...props}
    />
  )
}

import { Link as RouterLink, type LinkProps } from 'react-router-dom'

export default function Link({ className = '', ...props }: LinkProps) {
  return (
    <RouterLink
      className={`text-green-700 !underline hover:!text-green-900 ${className}`}
      {...props}
    />
  )
}

import { Link } from 'react-router-dom'

export default function Button({
  as = 'button',
  to,
  variant = 'primary',
  size = 'medium',
  className = '',
  children,
  ...props
}) {
  const classNames = ['button', `button--${variant}`, `button--${size}`, className]
    .filter(Boolean)
    .join(' ')

  if (as === 'link' && to) {
    return (
      <Link className={classNames} to={to} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classNames} type="button" {...props}>
      {children}
    </button>
  )
}
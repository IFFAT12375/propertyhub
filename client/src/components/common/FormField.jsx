import { useId } from 'react'

export default function FormField({
  label,
  as = 'input',
  options = [],
  hint,
  error,
  required = false,
  className = '',
  ...props
}) {
  const generatedId = useId()
  const id = props.id || generatedId
  const describedBy = [
    hint ? `${id}-hint` : null,
    error ? `${id}-error` : null,
  ]
    .filter(Boolean)
    .join(' ') || undefined
  const controlProps = {
    ...props,
    id,
    'aria-describedby': describedBy,
    'aria-invalid': error ? 'true' : undefined,
    className: `form-control ${className}`.trim(),
    required,
  }

  let control
  if (as === 'select') {
    control = (
      <select {...controlProps}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    )
  } else if (as === 'textarea') {
    control = <textarea {...controlProps} />
  } else {
    control = <input {...controlProps} />
  }

  return (
    <div className="form-field">
      <label htmlFor={id}>
        {label}
        {required && <span className="form-field__required"> *</span>}
      </label>
      {control}
      {hint && (
        <span className="form-field__hint" id={`${id}-hint`}>
          {hint}
        </span>
      )}
      {error && (
        <span className="form-field__error" id={`${id}-error`} role="alert">
          {error}
        </span>
      )}
    </div>
  )
}

import { SearchX } from 'lucide-react'

export default function EmptyState({
  title = 'Nothing here yet',
  description,
  action,
  icon: Icon = SearchX,
}) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon" aria-hidden="true">
        <Icon size={24} strokeWidth={1.7} />
      </span>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {action}
    </div>
  )
}

const statusLabels = {
  approved: 'Approved',
  available: 'Available',
  closed: 'Closed',
  contacted: 'Contacted',
  inactive: 'Inactive',
  new: 'New',
  pending: 'Pending review',
  rejected: 'Rejected',
  rented: 'Rented',
  sold: 'Sold',
  verified: 'Verified',
}

export default function Badge({ children, tone = 'neutral', status }) {
  const label = status ? statusLabels[status] || status : children

  return <span className={`badge badge--${status || tone}`}>{label}</span>
}

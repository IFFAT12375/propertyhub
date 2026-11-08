import { useState } from 'react'
import { Building2, ClipboardCheck, LayoutDashboard, Users } from 'lucide-react'
import Badge from '../components/common/Badge.jsx'
import Button from '../components/common/Button.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import FormField from '../components/common/FormField.jsx'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import { useAuth } from '../context/useAuth.js'
import { useMarketplace } from '../context/useMarketplace.js'

const navigation = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/seller-applications', label: 'Seller applications', icon: ClipboardCheck, end: true },
  { to: '/admin/properties', label: 'Property approvals', icon: Building2 },
  { to: '/admin/users', label: 'Users', icon: Users },
]

export default function AdminSellerApplications() {
  const { updateUserAccount } = useAuth()
  const { applications, reviewApplication, updateSellerStatus } = useMarketplace()
  const [reasons, setReasons] = useState({})
  const [message, setMessage] = useState('')
  const pending = applications.filter((application) => application.status === 'pending')
  const history = applications.filter((application) => application.status !== 'pending')

  function decide(application, decision) {
    const reason = reasons[application.id] || ''
    const result = reviewApplication(application.id, decision, reason)
    if (!result.success) {
      setMessage(result.message)
      return
    }

    const updatedUser = updateUserAccount(application.userId, {
      sellerApplicationStatus: decision,
      ...(decision === 'approved'
        ? { role: 'seller', sellerStatus: 'active', status: 'active' }
        : {}),
    })
    if (!updatedUser) {
      setMessage('Application status changed, but its demo account was not found.')
      return
    }
    if (decision === 'approved') updateSellerStatus(application.userId, 'active')
    setMessage(
      decision === 'approved'
        ? `${application.applicantName} was approved for seller access.`
        : `${application.applicantName} was rejected with a recorded reason.`,
    )
  }

  return (
    <DashboardLayout
      title="Seller applications"
      description="Review seller access requests separately from property listing approvals."
      navigation={navigation}
    >
      <div className="prototype-notice dashboard-notice">
        Approval updates only the mock account and application state. It does
        not perform identity checks or grant real platform permissions.
      </div>
      {message && <div className="success-message" role="status">{message}</div>}
      {pending.length ? (
        <div className="admin-review-list">
          {pending.map((application) => (
            <article className="admin-review-card" key={application.id}>
              <div className="admin-review-card__header">
                <div>
                  <span className="eyebrow">Seller access request</span>
                  <h2>{application.applicantName}</h2>
                  <p>{application.email} · {application.phone}</p>
                </div>
                <Badge status={application.status} />
              </div>
              <dl className="admin-review-card__facts">
                <div><dt>Applicant type</dt><dd>{application.sellerType === 'agent' ? 'Real estate agent' : 'Property owner'}</dd></div>
                {application.agencyName && (
                  <div><dt>Agency</dt><dd>{application.agencyName}</dd></div>
                )}
                <div><dt>Submitted</dt><dd>{application.submittedAt}</dd></div>
              </dl>
              <p className="admin-review-card__message">{application.message}</p>
              <FormField
                as="textarea"
                label="Rejection reason (required to reject)"
                value={reasons[application.id] || ''}
                onChange={(event) =>
                  setReasons((current) => ({
                    ...current,
                    [application.id]: event.target.value,
                  }))
                }
                placeholder="Explain what the applicant should address before reapplying."
              />
              <div className="admin-review-card__actions">
                <Button onClick={() => decide(application, 'approved')}>
                  Approve seller
                </Button>
                <Button
                  variant="outline"
                  disabled={!reasons[application.id]?.trim()}
                  onClick={() => decide(application, 'rejected')}
                >
                  Reject application
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ClipboardCheck}
          title="No applications are waiting"
          description="New seller access requests will appear in this queue."
        />
      )}
      {history.length > 0 && (
        <details className="admin-history">
          <summary>Decision history ({history.length})</summary>
          <div className="admin-history__list">
            {history.map((application) => (
              <article className="admin-history__item" key={application.id}>
                <div>
                  <strong>{application.applicantName}</strong>
                  <span>{application.email}</span>
                </div>
                <Badge status={application.status} />
                {application.rejectionReason && <p>{application.rejectionReason}</p>}
              </article>
            ))}
          </div>
        </details>
      )}
    </DashboardLayout>
  )
}

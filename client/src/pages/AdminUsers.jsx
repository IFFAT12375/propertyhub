import { useMemo, useState } from 'react'
import { Building2, ClipboardCheck, LayoutDashboard, Search, Users } from 'lucide-react'
import Badge from '../components/common/Badge.jsx'
import Button from '../components/common/Button.jsx'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import FormField from '../components/common/FormField.jsx'
import { useAuth } from '../context/useAuth.js'
import { useMarketplace } from '../context/useMarketplace.js'

const navigation = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/seller-applications', label: 'Seller applications', icon: ClipboardCheck },
  { to: '/admin/properties', label: 'Property approvals', icon: Building2 },
  { to: '/admin/users', label: 'Users', icon: Users, end: true },
]

export default function AdminUsers() {
  const { users, updateUserAccount } = useAuth()
  const { updateSellerStatus } = useMarketplace()
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('')
  const [message, setMessage] = useState('')
  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const queryMatches =
          !query ||
          `${user.name} ${user.email}`.toLowerCase().includes(query.toLowerCase())
        const roleMatches = !role || user.role === role
        return queryMatches && roleMatches
      }),
    [users, query, role],
  )

  function toggleSellerStatus(account) {
    const nextStatus =
      account.status === 'suspended' ? 'active' : 'suspended'
    const updated = updateUserAccount(account.id, {
      status: nextStatus,
      sellerStatus: nextStatus,
    })
    if (!updated) {
      setMessage('The account could not be updated.')
      return
    }
    updateSellerStatus(account.id, nextStatus)
    setMessage(
      nextStatus === 'suspended'
        ? `${account.name} was suspended; their listings are hidden from public search.`
        : `${account.name} was reactivated.`,
    )
  }

  return (
    <DashboardLayout
      title="User management"
      description="Review demo accounts and manage seller activation."
      navigation={navigation}
    >
      <div className="prototype-notice dashboard-notice">
        Account controls are in-memory demo behavior. They do not secure or
        modify real user records.
      </div>
      {message && <div className="success-message" role="status">{message}</div>}
      <div className="admin-user-filters">
        <FormField
          label="Search users"
          name="query"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Name or email"
        />
        <FormField
          as="select"
          label="Role"
          name="role"
          value={role}
          onChange={(event) => setRole(event.target.value)}
          options={[
            { value: '', label: 'All roles' },
            { value: 'user', label: 'Registered user' },
            { value: 'seller', label: 'Seller' },
            { value: 'admin', label: 'Administrator' },
          ]}
        />
        <span className="admin-user-filters__icon"><Search size={18} /></span>
      </div>
      <div className="admin-user-list">
        {filteredUsers.map((account) => (
          <article className="admin-user-row" key={account.id}>
            <div className="admin-user-row__identity">
              <span className="admin-user-row__avatar">{account.name.charAt(0)}</span>
              <span>
                <strong>{account.name}</strong>
                <small>{account.email}</small>
              </span>
            </div>
            <div className="admin-user-row__badges">
              <Badge>{account.role === 'user' ? 'Registered user' : account.role}</Badge>
              <Badge status={account.status || 'active'} />
              {account.sellerApplicationStatus && (
                <Badge status={account.sellerApplicationStatus} />
              )}
            </div>
            {account.role === 'seller' && (
              <Button
                variant={account.status === 'suspended' ? 'primary' : 'outline'}
                size="small"
                onClick={() => toggleSellerStatus(account)}
              >
                {account.status === 'suspended' ? 'Reactivate seller' : 'Suspend seller'}
              </Button>
            )}
          </article>
        ))}
        {!filteredUsers.length && (
          <div className="admin-user-list__empty">No accounts match your search.</div>
        )}
      </div>
    </DashboardLayout>
  )
}

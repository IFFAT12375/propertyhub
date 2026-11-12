import { useState } from 'react'
import { Building2, ClipboardCheck, LayoutDashboard, Search, Users } from 'lucide-react'
import Badge from '../components/common/Badge.jsx'
import Button from '../components/common/Button.jsx'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import FormField from '../components/common/FormField.jsx'
import { useGetAdminUsersQuery, useUpdateSellerStatusMutation } from '../services/api/adminApi.js'
import { apiErrorMessage } from '../utils/apiErrors.js'

const pageSize = 50
const navigation = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/seller-applications', label: 'Seller applications', icon: ClipboardCheck },
  { to: '/admin/properties', label: 'Property approvals', icon: Building2 },
  { to: '/admin/users', label: 'Users', icon: Users, end: true },
]

export default function AdminUsers() {
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('')
  const [page, setPage] = useState(1)
  const { data, isLoading, isFetching, error, refetch } = useGetAdminUsersQuery({
    page,
    limit: pageSize,
    ...(role ? { role } : {}),
  })
  const [updateStatus, { isLoading: isUpdating }] = useUpdateSellerStatusMutation()
  const [message, setMessage] = useState('')
  const [requestError, setRequestError] = useState('')
  const filteredUsers = (data?.users || []).filter((user) =>
    !query || `${user.name} ${user.email}`.toLowerCase().includes(query.toLowerCase()),
  )

  async function toggleSellerStatus(account) {
    const accountStatus = account.accountStatus === 'suspended' ? 'active' : 'suspended'
    setRequestError('')
    setMessage('')
    try {
      await updateStatus({ id: account.id, accountStatus }).unwrap()
      setMessage(accountStatus === 'suspended'
        ? `${account.name} was suspended; their listings are hidden from public search.`
        : `${account.name} was reactivated.`)
    } catch (mutationError) {
      setRequestError(apiErrorMessage(mutationError))
    }
  }

  return (
    <DashboardLayout
      title="User management"
      description="Review registered accounts and manage seller activation."
      navigation={navigation}
    >
      {message && <div className="success-message" role="status">{message}</div>}
      {requestError && <div className="form-alert" role="alert">{requestError}</div>}
      <div className="admin-user-filters">
        <FormField
          label="Search users on this page"
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
          onChange={(event) => {
            setRole(event.target.value)
            setPage(1)
          }}
          options={[
            { value: '', label: 'All roles' },
            { value: 'user', label: 'Registered user' },
            { value: 'seller', label: 'Seller' },
            { value: 'admin', label: 'Administrator' },
          ]}
        />
        <span className="admin-user-filters__icon"><Search size={18} /></span>
      </div>
      {isLoading ? (
        <p role="status">Loading user accounts…</p>
      ) : error ? (
        <EmptyState
          title="Users could not be loaded"
          description={apiErrorMessage(error)}
          action={<Button variant="outline" onClick={refetch}>Try again</Button>}
        />
      ) : (
        <div className="admin-user-list" aria-busy={isFetching}>
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
                <Badge status={account.accountStatus} />
              </div>
              {account.role === 'seller' && (
                <Button
                  variant={account.accountStatus === 'suspended' ? 'primary' : 'outline'}
                  size="small"
                  disabled={isUpdating}
                  onClick={() => void toggleSellerStatus(account)}
                >
                  {account.accountStatus === 'suspended' ? 'Reactivate seller' : 'Suspend seller'}
                </Button>
              )}
            </article>
          ))}
          {!filteredUsers.length && (
            <div className="admin-user-list__empty">
              {data?.users?.length ? 'No accounts on this page match your search.' : 'No accounts match your filters.'}
            </div>
          )}
        </div>
      )}
      {data?.pagination?.totalPages > 1 && (
        <nav className="pagination" aria-label="User account pages">
          <Button variant="outline" disabled={page === 1 || isFetching} onClick={() => setPage((value) => value - 1)}>Previous</Button>
          <span>Page {page} of {data.pagination.totalPages}</span>
          <Button variant="outline" disabled={page >= data.pagination.totalPages || isFetching} onClick={() => setPage((value) => value + 1)}>Next</Button>
        </nav>
      )}
    </DashboardLayout>
  )
}

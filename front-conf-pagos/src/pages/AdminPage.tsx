import { useState, useEffect } from 'react'
import AdminLogin from './AdminLogin'
import AdminDashboard from './AdminDashboard'

const ADMIN_KEY = 'adminKey'

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState<string | null>(null)

  useEffect(() => {
    const key = sessionStorage.getItem(ADMIN_KEY)
    if (key) setAdminKey(key)
  }, [])

  const handleLoginSuccess = (key: string) => {
    sessionStorage.setItem(ADMIN_KEY, key)
    setAdminKey(key)
  }

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_KEY)
    setAdminKey(null)
  }

  if (adminKey) {
    return (
      <AdminDashboard adminKey={adminKey} onLogout={handleLogout} />
    )
  }

  return <AdminLogin onSuccess={handleLoginSuccess} />
}

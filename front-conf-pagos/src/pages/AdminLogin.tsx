import { useState } from 'react'

const API = '/api'

export default function AdminLogin({
  onSuccess,
}: {
  onSuccess: (key: string) => void
}) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`${API}/admin/estadisticas`, {
        headers: { 'X-Admin-Key': password },
      })
      if (!res.ok) {
        if (res.status === 401) {
          setError('Clave incorrecta.')
        } else {
          setError('Error al verificar. Intente de nuevo.')
        }
        return
      }
      onSuccess(password)
    } catch {
      setError('Error de conexión. Compruebe que el backend esté en marcha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-card">
        <h1 className="admin-login-title">Acceso administrador</h1>
        <p className="admin-login-subtitle">Introduzca la clave de administrador para continuar.</p>
        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="admin-password">Clave</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-input"
              placeholder="Clave de administrador"
              required
              autoFocus
            />
          </div>
          {error && <div className="admin-error-msg">{error}</div>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Verificando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

import { useState, useEffect, useCallback } from 'react'

const API = '/api'

type EstadoConfirmacion = 'PENDIENTE' | 'REALIZADO' | 'NO_REALIZADO'

interface ComprobanteRow {
  id: string
  estudiante: string
  estudianteCedula: string
  modulo: string
  montoModulo: number
  numeroTransaccion: string | null
  monto: number
  fechaPago: string
  cuentaDestino: string | null
  confirmacionPago: EstadoConfirmacion
  urlImagen: string
  createdAt: string
}

interface Estadisticas {
  total: number
  pendientes: number
  realizados: number
  noRealizados: number
}

export default function AdminDashboard({
  adminKey,
  onLogout,
}: {
  adminKey: string
  onLogout: () => void
}) {
  const [comprobantes, setComprobantes] = useState<ComprobanteRow[]>([])
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null)
  const [estadoFiltro, setEstadoFiltro] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const headers = () => ({ 'X-Admin-Key': adminKey })

  const fetchComprobantes = useCallback(async () => {
    try {
      const url = estadoFiltro
        ? `${API}/admin/comprobantes?estado=${estadoFiltro}`
        : `${API}/admin/comprobantes`
      const res = await fetch(url, { headers: headers() })
      if (res.status === 401) {
        onLogout()
        return
      }
      if (!res.ok) throw new Error('Error al cargar comprobantes')
      const data = await res.json()
      setComprobantes(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar')
    }
  }, [estadoFiltro, onLogout])

  const fetchEstadisticas = useCallback(async () => {
    try {
      const res = await fetch(`${API}/admin/estadisticas`, { headers: headers() })
      if (res.status === 401) {
        onLogout()
        return
      }
      if (!res.ok) return
      const data = await res.json()
      setEstadisticas(data)
    } catch {
      // ignore
    }
  }, [onLogout])

  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([fetchComprobantes(), fetchEstadisticas()]).finally(() =>
      setLoading(false),
    )
  }, [fetchComprobantes, fetchEstadisticas])

  const cambiarConfirmacion = async (id: string, confirmacionPago: EstadoConfirmacion) => {
    setUpdatingId(id)
    try {
      const res = await fetch(`${API}/admin/comprobantes/${id}/confirmacion`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...headers(),
        },
        body: JSON.stringify({ confirmacionPago }),
      })
      if (res.status === 401) {
        onLogout()
        return
      }
      if (!res.ok) throw new Error('Error al actualizar')
      setComprobantes((prev) =>
        prev.map((c) => (c.id === id ? { ...c, confirmacionPago } : c)),
      )
      fetchEstadisticas()
    } catch {
      setError('Error al actualizar el estado.')
    } finally {
      setUpdatingId(null)
    }
  }

  const formatDate = (s: string) => {
    try {
      return new Date(s).toLocaleString('es', {
        dateStyle: 'short',
        timeStyle: 'short',
      })
    } catch {
      return s
    }
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <h1 className="admin-dashboard-title">Panel de administración</h1>
        <button type="button" className="btn-admin-logout" onClick={onLogout}>
          Cerrar sesión
        </button>
      </div>

      {estadisticas && (
        <div className="admin-stats">
          <div className="admin-stat-card">
            <span className="admin-stat-value">{estadisticas.total}</span>
            <span className="admin-stat-label">Total comprobantes</span>
          </div>
          <div className="admin-stat-card pendientes">
            <span className="admin-stat-value">{estadisticas.pendientes}</span>
            <span className="admin-stat-label">Pendientes</span>
          </div>
          <div className="admin-stat-card realizados">
            <span className="admin-stat-value">{estadisticas.realizados}</span>
            <span className="admin-stat-label">Realizados</span>
          </div>
          <div className="admin-stat-card no-realizados">
            <span className="admin-stat-value">{estadisticas.noRealizados}</span>
            <span className="admin-stat-label">No realizados</span>
          </div>
        </div>
      )}

      <div className="admin-toolbar">
        <label className="admin-filter-label">
          Filtrar por estado
          <select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
            className="admin-filter-select"
          >
            <option value="">Todos</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="REALIZADO">Realizado</option>
            <option value="NO_REALIZADO">No realizado</option>
          </select>
        </label>
      </div>

      {error && <div className="admin-error-msg">{error}</div>}

      {loading ? (
        <div className="loading">Cargando comprobantes…</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Módulo</th>
                <th>Nº documento</th>
                <th>Monto</th>
                <th>Fecha pago</th>
                <th>Confirmación</th>
                <th>Comprobante</th>
              </tr>
            </thead>
            <tbody>
              {comprobantes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="admin-table-empty">
                    No hay comprobantes para mostrar.
                  </td>
                </tr>
              ) : (
                comprobantes.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="admin-cell-estudiante">{c.estudiante}</div>
                      <div className="admin-cell-cedula">{c.estudianteCedula}</div>
                    </td>
                    <td>{c.modulo}</td>
                    <td>{c.numeroTransaccion ?? '—'}</td>
                    <td>{c.monto.toFixed(2)}</td>
                    <td>{formatDate(c.fechaPago)}</td>
                    <td>
                      <select
                        value={c.confirmacionPago}
                        onChange={(e) =>
                          cambiarConfirmacion(c.id, e.target.value as EstadoConfirmacion)
                        }
                        disabled={updatingId === c.id}
                        className={`admin-select-estado ${c.confirmacionPago.toLowerCase()}`}
                      >
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="REALIZADO">Realizado</option>
                        <option value="NO_REALIZADO">No realizado</option>
                      </select>
                    </td>
                    <td>
                      <a
                        href={`${API}/${c.urlImagen}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="admin-link-imagen"
                      >
                        Ver imagen
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

import { useState, useEffect, useCallback } from 'react'

const API = '/api'

type Estado = 'PENDIENTE' | 'REALIZADO' | 'NO_REALIZADO'

interface ResumenEstudiante {
  estudianteId: string
  estudiante: string
  cedula: string
  generacion: string
  modulo: string
  montoModulo: number
  totalAbonado: number
  saldoFaltante: number
  cantidadComprobantes: number
  estado: Estado
  numeroTransaccion: string | null
  urlImagen: string | null
  fechaPago: string | null
}

interface Estadisticas {
  total: number
  pendientes: number
  realizados: number
  noRealizados: number
}

function IconoEstado({ estado }: { estado: Estado }) {
  const config = {
    REALIZADO: {
      label: 'Realizado',
      className: 'estado-badge realizado',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M20 6L9 17l-5-5" />
        </svg>
      ),
    },
    PENDIENTE: {
      label: 'Pendiente',
      className: 'estado-badge pendiente',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      ),
    },
    NO_REALIZADO: {
      label: 'No realizado',
      className: 'estado-badge no-realizado',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="10" />
          <path d="M15 9l-6 6M9 9l6 6" />
        </svg>
      ),
    },
  }
  const c = config[estado]
  return (
    <span className={c.className} title={c.label}>
      {c.icon}
      <span>{c.label}</span>
    </span>
  )
}

export default function AdminDashboard({
  adminKey,
  onLogout,
}: {
  adminKey: string
  onLogout: () => void
}) {
  const [filas, setFilas] = useState<ResumenEstudiante[]>([])
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null)
  const [estadoFiltro, setEstadoFiltro] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const headers = () => ({ 'X-Admin-Key': adminKey })

  const fetchResumen = useCallback(async () => {
    try {
      const res = await fetch(`${API}/admin/resumen-estudiantes`, { headers: headers() })
      if (res.status === 401) {
        onLogout()
        return
      }
      if (!res.ok) throw new Error('Error al cargar resumen')
      const data: ResumenEstudiante[] = await res.json()
      setFilas(data)
      const pendientes = data.filter((r) => r.estado === 'PENDIENTE').length
      const realizados = data.filter((r) => r.estado === 'REALIZADO').length
      const noRealizados = data.filter((r) => r.estado === 'NO_REALIZADO').length
      setEstadisticas({
        total: data.length,
        pendientes,
        realizados,
        noRealizados,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar')
    }
  }, [onLogout])

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchResumen().finally(() => setLoading(false))
  }, [fetchResumen])

  const filasFiltradas =
    estadoFiltro === ''
      ? filas
      : filas.filter((f) => f.estado === estadoFiltro)

  const formatDate = (s: string | null) => {
    if (!s) return '—'
    try {
      return new Date(s).toLocaleString('es', { dateStyle: 'short', timeStyle: 'short' })
    } catch {
      return '—'
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
          <button
            type="button"
            className={`admin-stat-card admin-stat-card-total ${estadoFiltro === '' ? 'active' : ''}`}
            onClick={() => setEstadoFiltro('')}
          >
            <div className="admin-stat-card-body">
              <span className="admin-stat-value">{estadisticas.total}</span>
              <span className="admin-stat-label">Total estudiantes</span>
              <span className="admin-stat-icon" aria-hidden>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </span>
            </div>
            <div className="admin-stat-card-footer">Ver más →</div>
          </button>
          <button
            type="button"
            className={`admin-stat-card admin-stat-card-pendientes ${estadoFiltro === 'PENDIENTE' ? 'active' : ''}`}
            onClick={() => setEstadoFiltro('PENDIENTE')}
          >
            <div className="admin-stat-card-body">
              <span className="admin-stat-value">{estadisticas.pendientes}</span>
              <span className="admin-stat-label">Pendientes</span>
              <span className="admin-stat-icon" aria-hidden>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </span>
            </div>
            <div className="admin-stat-card-footer">Ver más →</div>
          </button>
          <button
            type="button"
            className={`admin-stat-card admin-stat-card-realizados ${estadoFiltro === 'REALIZADO' ? 'active' : ''}`}
            onClick={() => setEstadoFiltro('REALIZADO')}
          >
            <div className="admin-stat-card-body">
              <span className="admin-stat-value">{estadisticas.realizados}</span>
              <span className="admin-stat-label">Realizados</span>
              <span className="admin-stat-icon" aria-hidden>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <path d="M22 4L12 14.01l-3-3" />
                </svg>
              </span>
            </div>
            <div className="admin-stat-card-footer">Ver más →</div>
          </button>
          <button
            type="button"
            className={`admin-stat-card admin-stat-card-no-realizados ${estadoFiltro === 'NO_REALIZADO' ? 'active' : ''}`}
            onClick={() => setEstadoFiltro('NO_REALIZADO')}
          >
            <div className="admin-stat-card-body">
              <span className="admin-stat-value">{estadisticas.noRealizados}</span>
              <span className="admin-stat-label">No realizados</span>
              <span className="admin-stat-icon" aria-hidden>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M15 9l-6 6M9 9l6 6" />
                </svg>
              </span>
            </div>
            <div className="admin-stat-card-footer">Ver más →</div>
          </button>
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
        <div className="loading">Cargando estudiantes…</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Generación</th>
                <th>Módulo</th>
                <th>Nº documento</th>
                <th>Monto</th>
                <th>Saldo faltante</th>
                <th>Fecha pago</th>
                <th>Estado</th>
                <th>Comprobante</th>
              </tr>
            </thead>
            <tbody>
              {filasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={9} className="admin-table-empty">
                    No hay estudiantes para mostrar.
                  </td>
                </tr>
              ) : (
                filasFiltradas.map((r) => (
                  <tr key={r.estudianteId}>
                    <td>
                      <div className="admin-cell-estudiante">{r.estudiante}</div>
                      <div className="admin-cell-cedula">{r.cedula}</div>
                    </td>
                    <td className="admin-cell-nowrap"><span className="admin-cell-generacion">{r.generacion}</span></td>
                    <td className="admin-cell-nowrap">{r.modulo}</td>
                    <td>{r.numeroTransaccion ?? '—'}</td>
                    <td className="admin-cell-monto">{r.monto.toFixed(2)}</td>
                    <td className={`admin-cell-saldo ${r.saldoFaltante > 0 ? 'saldo-pendiente' : 'saldo-cero'}`}>
                      {r.saldoFaltante.toFixed(2)}
                    </td>
                    <td className="admin-cell-nowrap">{formatDate(r.fechaPago)}</td>
                    <td>
                      <IconoEstado estado={r.estado} />
                    </td>
                    <td>
                      {r.urlImagen ? (
                        <a
                          href={`${API}/${r.urlImagen}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin-link-imagen"
                        >
                          Ver imagen
                        </a>
                      ) : (
                        <span className="admin-sin-comprobante">—</span>
                      )}
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

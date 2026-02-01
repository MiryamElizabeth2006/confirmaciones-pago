import { useState, useEffect, useCallback } from 'react'

const API = '/api'

interface OpcionModulo {
  id: string
  nombre: string
}

interface OpcionEstudiante {
  id: string
  nombre: string
  generacion: string
}

interface OpcionesResponse {
  modulos: OpcionModulo[]
  estudiantes: OpcionEstudiante[]
}

interface ResultadoValidacion {
  valido: boolean
  mensaje: string
  datosExtraidos?: {
    numeroTransaccion?: string
    monto?: number
    fecha?: string
    nombreCuentaDestino?: string
  }
  coincidenciaExcel?: unknown
  error?: string
}

export default function HomePage() {
  const [modulos, setModulos] = useState<OpcionModulo[]>([])
  const [estudiantes, setEstudiantes] = useState<OpcionEstudiante[]>([])
  const [moduloId, setModuloId] = useState('')
  const [estudianteId, setEstudianteId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<ResultadoValidacion | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const fetchOpciones = useCallback(async () => {
    try {
      setLoadError(null)
      const res = await fetch(`${API}/confirmacion-pago/opciones`)
      if (!res.ok) throw new Error('Error al cargar opciones')
      const data: OpcionesResponse = await res.json()
      const mods = data.modulos ?? []
      const ests = data.estudiantes ?? []
      setModulos(mods)
      setEstudiantes(ests)
      setModuloId((id) => id || (mods[0]?.id ?? ''))
      setEstudianteId((id) => id || (ests[0]?.id ?? ''))
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Error al cargar opciones')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOpciones()
  }, [fetchOpciones])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setResult({ valido: false, mensaje: 'Debe seleccionar una imagen del comprobante.' })
      return
    }
    setResult(null)
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('moduloId', moduloId)
      formData.append('estudianteId', estudianteId)
      formData.append('comprobante', file)
      const res = await fetch(`${API}/confirmacion-pago/validar`, {
        method: 'POST',
        body: formData,
      })
      const data: ResultadoValidacion = await res.json()
      setResult(data)
    } catch (e) {
      setResult({
        valido: false,
        mensaje: 'Error de conexión. Compruebe que el backend esté en marcha.',
        error: e instanceof Error ? e.message : String(e),
      })
    } finally {
      setSubmitting(false)
    }
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith('image/')) setFile(f)
  }, [])

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const onDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  if (loading) {
    return <div className="loading">Cargando módulos y estudiantes…</div>
  }

  if (loadError) {
    return (
      <div className="error-load">
        {loadError}. Compruebe que el backend esté en ejecución (puerto 3000).
      </div>
    )
  }

  return (
    <div className="page-center">
      <header className="app-header">
        <h1 className="app-title">Confirmación de pago</h1>
        <p className="app-subtitle">
          Seleccione módulo, estudiante y suba la imagen del comprobante. La validación se realiza contra el extracto (Excel).
        </p>
      </header>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="modulo">Módulo</label>
            <select
              id="modulo"
              value={moduloId}
              onChange={(e) => setModuloId(e.target.value)}
              required
            >
              <option value="">Seleccione un módulo</option>
              {modulos.map((m) => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="estudiante">Estudiante</label>
            <select
              id="estudiante"
              value={estudianteId}
              onChange={(e) => setEstudianteId(e.target.value)}
              required
            >
              <option value="">Seleccione un estudiante</option>
              {estudiantes.map((e) => (
                <option key={e.id} value={e.id}>{e.nombre} ({e.generacion})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Comprobante (imagen)</label>
            <div
              className={`upload-zone ${dragOver ? 'dragover' : ''}`}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {file ? (
                <span className="upload-file-name">{file.name}</span>
              ) : (
                <span className="upload-text">Arrastre una imagen aquí o haga clic para seleccionar</span>
              )}
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={submitting || !file}>
            {submitting ? 'Enviando…' : 'Enviar comprobante'}
          </button>
        </form>

        {result && (
          <div className={`result-box ${result.valido ? 'success' : 'error'}`}>
            <div className="result-title">
              {result.valido ? 'Comprobante válido' : 'Comprobante no válido'}
            </div>
            <div>{result.mensaje}</div>
            {result.datosExtraidos && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', opacity: 0.9 }}>
                {result.datosExtraidos.numeroTransaccion != null && (
                  <div>Nº documento: {result.datosExtraidos.numeroTransaccion}</div>
                )}
                {result.datosExtraidos.monto != null && (
                  <div>Monto: {result.datosExtraidos.monto}</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

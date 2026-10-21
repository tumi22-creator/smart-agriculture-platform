import { useState } from 'react'
import {
  Sprout, MapPin, Ruler, Thermometer, Droplets, Wind,
  AlertTriangle, RefreshCw, Leaf, Activity, LogOut,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import './App.css'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:8081').replace(/\/$/, '')

const emptyCropForm = (farmId = '') => ({
  name: '',
  variety: '',
  plantingDate: '',
  expectedHarvestDate: '',
  status: 'PLANTED',
  farmId: String(farmId),
})

const emptyFarmForm = {
  name: '',
  location: '',
  sizeInHectares: '',
  soilType: 'Loam',
}

const emptySensorForm = {
  soilMoisture: '45',
  temperature: '28',
  humidity: '60',
}

function formatDate(value) {
  if (!value) return 'Not recorded'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString()
}

async function responseError(response, fallback) {
  let detail = ''
  try {
    const body = await response.clone().json()
    detail = body.message || body.error || body.detail || ''
  } catch {
    try {
      detail = await response.clone().text()
    } catch {
      // The response may not include a readable error body.
    }
  }

  if (response.status === 401 || response.status === 403) {
    return new Error('Your session was rejected. Please sign in again.')
  }
  return new Error(detail || `${fallback} (HTTP ${response.status})`)
}

function App() {
  const [farms, setFarms] = useState([])
  const [crops, setCrops] = useState([])
  const [readings, setReadings] = useState([])
  const [alerts, setAlerts] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [credentials, setCredentials] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [selectedFarmId, setSelectedFarmId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loginError, setLoginError] = useState('')
  const [resolvingAlertId, setResolvingAlertId] = useState(null)
  const [sensorForm, setSensorForm] = useState(emptySensorForm)
  const [savingReading, setSavingReading] = useState(false)
  const [sensorMessage, setSensorMessage] = useState('')
  const [cropForm, setCropForm] = useState(emptyCropForm())
  const [savingCrop, setSavingCrop] = useState(false)
  const [cropMessage, setCropMessage] = useState('')
  const [editingCropId, setEditingCropId] = useState(null)
  const [deletingCropId, setDeletingCropId] = useState(null)
  const [farmForm, setFarmForm] = useState(emptyFarmForm)
  const [savingFarm, setSavingFarm] = useState(false)
  const [farmMessage, setFarmMessage] = useState('')

  function apiFetch(url, options = {}, auth = credentials) {
    const headers = new Headers(options.headers || {})
    if (auth) headers.set('Authorization', `Basic ${auth}`)
    if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }
    return fetch(url, { ...options, headers })
  }

  async function loadDashboard(farmId = selectedFarmId, auth = credentials) {
    if (!auth) return
    setLoading(true)
    setError('')

    try {
      const farmResponse = await apiFetch(`${API}/api/farms`, {}, auth)
      if (!farmResponse.ok) throw await responseError(farmResponse, 'Could not load farms')
      const farmData = await farmResponse.json()
      setFarms(Array.isArray(farmData) ? farmData : [])

      if (!Array.isArray(farmData) || farmData.length === 0) {
        setSelectedFarmId('')
        setCrops([])
        setReadings([])
        setAlerts([])
        return
      }

      const requestedFarmExists = farmData.some(item => String(item.id) === String(farmId))
      const activeFarmId = requestedFarmExists ? String(farmId) : String(farmData[0].id)
      setSelectedFarmId(activeFarmId)

      const [cropResponse, readingResponse, alertResponse] = await Promise.all([
        apiFetch(`${API}/api/crops/farm/${activeFarmId}`, {}, auth),
        apiFetch(`${API}/api/farms/${activeFarmId}/sensor-readings`, {}, auth),
        apiFetch(`${API}/api/farms/${activeFarmId}/alerts/active`, {}, auth),
      ])

      const responses = [
        [cropResponse, 'Could not load crops'],
        [readingResponse, 'Could not load sensor readings'],
        [alertResponse, 'Could not load active alerts'],
      ]
      for (const [response, message] of responses) {
        if (!response.ok) throw await responseError(response, message)
      }

      const [cropData, readingData, alertData] = await Promise.all([
        cropResponse.json(),
        readingResponse.json(),
        alertResponse.json(),
      ])

      setCrops(Array.isArray(cropData) ? cropData : [])
      setReadings(Array.isArray(readingData) ? readingData : [])
      setAlerts(Array.isArray(alertData) ? alertData : [])
    } catch (err) {
      setError(err.message || 'Could not load dashboard data.')
      if (String(err.message).toLowerCase().includes('sign in again')) {
        handleLogout()
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin(event) {
    event.preventDefault()
    setLoginError('')
    setError('')

    if (!username.trim() || !password) {
      setLoginError('Enter your administrator username and password.')
      return
    }

    let auth
    try {
      auth = btoa(unescape(encodeURIComponent(`${username.trim()}:${password}`)))
    } catch {
      setLoginError('Could not prepare login credentials. Check the username and password.')
      return
    }

    setLoading(true)
    try {
      const response = await apiFetch(`${API}/api/farms`, {}, auth)
      if (response.status === 401 || response.status === 403) {
        setLoginError('Invalid username or password, or this account does not have administrator access.')
        return
      }
      if (!response.ok) throw await responseError(response, 'Could not connect to the backend')

      const farmData = await response.json()
      setCredentials(auth)
      setIsLoggedIn(true)
      setPassword('')
      setFarms(Array.isArray(farmData) ? farmData : [])
      const initialFarmId = Array.isArray(farmData) && farmData.length
        ? String(farmData[0].id)
        : ''
      setSelectedFarmId(initialFarmId)

      if (initialFarmId) {
        await loadDashboard(initialFarmId, auth)
      } else {
        setCrops([])
        setReadings([])
        setAlerts([])
      }
    } catch (err) {
      setLoginError(err.message || 'Could not connect to Spring Boot. Check that it is running on port 8081.')
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    setCredentials('')
    setIsLoggedIn(false)
    setPassword('')
    setFarms([])
    setCrops([])
    setReadings([])
    setAlerts([])
    setSelectedFarmId('')
    setError('')
    setLoginError('')
  }

  async function resolveAlert(alertId) {
    setResolvingAlertId(alertId)
    setError('')
    try {
      const response = await apiFetch(
        `${API}/api/farms/${selectedFarmId}/alerts/${alertId}/resolve`,
        { method: 'PUT' },
      )
      if (!response.ok) throw await responseError(response, 'Failed to resolve alert')
      await loadDashboard(selectedFarmId, credentials)
    } catch (err) {
      setError(err.message || 'Could not resolve alert.')
    } finally {
      setResolvingAlertId(null)
    }
  }

  async function submitSensorReading(event) {
    event.preventDefault()
    setSavingReading(true)
    setSensorMessage('')
    setError('')
    try {
      const payload = {
        soilMoisture: Number(sensorForm.soilMoisture),
        temperature: Number(sensorForm.temperature),
        humidity: Number(sensorForm.humidity),
      }
      if (
        !Number.isFinite(payload.soilMoisture) ||
        payload.soilMoisture < 0 || payload.soilMoisture > 100 ||
        !Number.isFinite(payload.temperature) ||
        !Number.isFinite(payload.humidity) ||
        payload.humidity < 0 || payload.humidity > 100
      ) {
        throw new Error('Enter valid readings. Moisture and humidity must be between 0 and 100.')
      }

      const response = await apiFetch(
        `${API}/api/farms/${selectedFarmId}/sensor-readings`,
        { method: 'POST', body: JSON.stringify(payload) },
      )
      if (!response.ok) throw await responseError(response, 'Could not save sensor reading')

      setSensorMessage('Sensor reading saved successfully.')
      await loadDashboard(selectedFarmId, credentials)
    } catch (err) {
      setError(err.message || 'Could not save sensor reading.')
    } finally {
      setSavingReading(false)
    }
  }

  async function submitCrop(event) {
    event.preventDefault()
    setSavingCrop(true)
    setCropMessage('')
    setError('')

    try {
      if (!cropForm.farmId) throw new Error('Select a farm for this crop.')
      const isEditing = editingCropId !== null
      const url = isEditing ? `${API}/api/crops/${editingCropId}` : `${API}/api/crops`
      const payload = {
        name: cropForm.name.trim(),
        variety: cropForm.variety.trim(),
        plantingDate: cropForm.plantingDate || null,
        expectedHarvestDate: cropForm.expectedHarvestDate || null,
        status: cropForm.status,
      }

      const response = await apiFetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw await responseError(response, 'Could not save crop')

      const savedCrop = await response.json()
      const assignmentResponse = await apiFetch(
        `${API}/api/crops/${savedCrop.id}/farm/${cropForm.farmId}`,
        { method: 'PUT' },
      )
      if (!assignmentResponse.ok) {
        throw await responseError(assignmentResponse, 'Crop saved, but assigning it to the selected farm failed')
      }

      setEditingCropId(null)
      setCropMessage(isEditing ? 'Crop updated successfully.' : 'Crop created and assigned to the farm.')
      setCropForm(emptyCropForm(selectedFarmId))
      await loadDashboard(selectedFarmId, credentials)
    } catch (err) {
      setError(err.message || 'Could not save crop.')
    } finally {
      setSavingCrop(false)
    }
  }

  async function submitFarm(event) {
    event.preventDefault()
    setSavingFarm(true)
    setFarmMessage('')
    setError('')

    try {
      const size = Number(farmForm.sizeInHectares)
      if (!Number.isFinite(size) || size <= 0) throw new Error('Farm size must be greater than zero.')

      const response = await apiFetch(`${API}/api/farms`, {
        method: 'POST',
        body: JSON.stringify({
          name: farmForm.name.trim(),
          location: farmForm.location.trim(),
          sizeInHectares: size,
          soilType: farmForm.soilType,
        }),
      })
      if (!response.ok) throw await responseError(response, 'Could not register farm')

      const savedFarm = await response.json()
      setFarmMessage('Farm registered successfully.')
      setFarmForm(emptyFarmForm)
      await loadDashboard(String(savedFarm.id), credentials)
    } catch (err) {
      setError(err.message || 'Could not register farm.')
    } finally {
      setSavingFarm(false)
    }
  }

  function editCrop(crop) {
    setEditingCropId(crop.id)
    setCropMessage('')
    setCropForm({
      name: crop.name || '',
      variety: crop.variety || '',
      plantingDate: crop.plantingDate || '',
      expectedHarvestDate: crop.expectedHarvestDate || '',
      status: crop.status || 'PLANTED',
      farmId: String(selectedFarmId || ''),
    })
    document.getElementById('crop-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  function cancelCropEdit() {
    setEditingCropId(null)
    setCropForm(emptyCropForm(selectedFarmId))
    setCropMessage('')
  }

  async function deleteCrop(cropId) {
    if (!window.confirm('Are you sure you want to delete this crop?')) return
    setDeletingCropId(cropId)
    setError('')
    try {
      const response = await apiFetch(`${API}/api/crops/${cropId}`, { method: 'DELETE' })
      if (!response.ok) throw await responseError(response, 'Could not delete crop')
      setCropMessage('Crop deleted successfully.')
      if (String(editingCropId) === String(cropId)) cancelCropEdit()
      await loadDashboard(selectedFarmId, credentials)
    } catch (err) {
      setError(err.message || 'Could not delete crop.')
    } finally {
      setDeletingCropId(null)
    }
  }

  const selectedFarm = farms.find(item => String(item.id) === String(selectedFarmId))
  const latest = readings[0]
  const sensorStats = readings.length ? {
    averageMoisture: (
      readings.reduce((sum, reading) => sum + Number(reading.soilMoisture || 0), 0) /
      readings.length
    ).toFixed(1),
    averageTemperature: (
      readings.reduce((sum, reading) => sum + Number(reading.temperature || 0), 0) /
      readings.length
    ).toFixed(1),
    averageHumidity: (
      readings.reduce((sum, reading) => sum + Number(reading.humidity || 0), 0) /
      readings.length
    ).toFixed(1),
    totalReadings: readings.length,
  } : null

  const chartData = [...readings].reverse().map(reading => ({
    time: reading.recordedAt ? new Date(reading.recordedAt).toLocaleString() : 'Unknown',
    'Soil Moisture': Number(reading.soilMoisture || 0),
    Temperature: Number(reading.temperature || 0),
    Humidity: Number(reading.humidity || 0),
  }))

  if (!isLoggedIn) {
    return (
      <main className="dashboard">
        <header className="topbar">
          <div className="brand">
            <div className="brand-icon"><Sprout size={25} /></div>
            <div>
              <h1>AgriMonitor</h1>
              <p>Smart Agriculture Platform</p>
            </div>
          </div>
        </header>

        <section className="panel login-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">SECURE ADMIN ACCESS</p>
              <h2>Sign in to AgriMonitor</h2>
              <p className="muted">Use the administrator credentials configured for your Spring Boot backend.</p>
            </div>
            <Sprout size={24} />
          </div>
          {loginError && <div className="error-banner" role="alert">{loginError}</div>}
          <form className="sensor-form" onSubmit={handleLogin}>
            <label>
              Username
              <input
                autoComplete="username"
                value={username}
                onChange={event => setUsername(event.target.value)}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                required
              />
            </label>
            <button className="resolve-button" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <p className="muted">Credentials are kept in memory for this browser session and are not saved to local storage.</p>
        </section>
        <footer>AgriMonitor · Smart Agriculture Platform</footer>
      </main>
    )
  }

  return (
    <main className="dashboard">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon"><Sprout size={25} /></div>
          <div>
            <h1>AgriMonitor</h1>
            <p>Smart Agriculture Platform</p>
          </div>
        </div>
        <div className="topbar-actions">
          <button
            className="refresh-button"
            type="button"
            onClick={() => loadDashboard(selectedFarmId, credentials)}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            Refresh
          </button>
          <button className="refresh-button" type="button" onClick={handleLogout}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </header>

      {error && <div className="error-banner" role="alert">{error}</div>}

      <section className="welcome">
        <div>
          <p className="eyebrow">FARM OVERVIEW</p>
          <h2>Monitor your farm</h2>
          <p className="muted">Track crop progress, sensor conditions and farm alerts.</p>
        </div>
        <div className="date-label">
          <label htmlFor="farm-selector">Selected farm</label>
          <select
            id="farm-selector"
            value={selectedFarmId}
            onChange={event => {
              const farmId = event.target.value
              setSelectedFarmId(farmId)
              setCropForm(current => ({ ...current, farmId }))
              loadDashboard(farmId, credentials)
            }}
            disabled={farms.length === 0 || loading}
          >
            {farms.map(item => (
              <option key={item.id} value={String(item.id)}>{item.name}</option>
            ))}
          </select>
          <p>{new Date().toLocaleDateString()}</p>
        </div>
      </section>

      {loading && <p className="loading-message">Loading dashboard data...</p>}

      {farms.length === 0 ? (
        <section className="panel">
          <h3>No farms registered yet</h3>
          <p>Use the farm registration form below to create your first farm.</p>
        </section>
      ) : (
        <>
          <section className="stats-grid">
            <article className="stat-card">
              <div className="stat-icon green"><Sprout /></div>
              <p>Total farms</p><strong>{farms.length}</strong><span>Registered farms</span>
            </article>
            <article className="stat-card">
              <div className="stat-icon lime"><Leaf /></div>
              <p>Tracked crops</p><strong>{crops.length}</strong><span>For selected farm</span>
            </article>
            <article className="stat-card">
              <div className="stat-icon amber"><Activity /></div>
              <p>Active alerts</p><strong>{alerts.length}</strong><span>Need attention</span>
            </article>
            <article className="stat-card">
              <div className="stat-icon blue"><Ruler /></div>
              <p>Total land</p>
              <strong>{farms.reduce((sum, item) => sum + Number(item.sizeInHectares || 0), 0).toLocaleString()}</strong>
              <span>Hectares across farms</span>
            </article>
          </section>

          <section className="content-grid">
            <article className="panel farm-panel">
              <div className="panel-heading">
                <div><p className="eyebrow">YOUR PROPERTY</p><h3>Selected farm details</h3></div>
                <Sprout size={22} />
              </div>
              {selectedFarm ? (
                <div className="farm-details">
                  <h4>{selectedFarm.name}</h4>
                  <p><MapPin size={16} /> {selectedFarm.location || 'Location not specified'}</p>
                  <p><Ruler size={16} /> {selectedFarm.sizeInHectares} hectares</p>
                  <p><Leaf size={16} /> {selectedFarm.soilType || 'Soil type not specified'} soil</p>
                </div>
              ) : <p>Select a farm to see its details.</p>}
            </article>

            <article className="panel sensor-panel">
              <div className="panel-heading">
                <div><p className="eyebrow">LATEST READING</p><h3>Sensor conditions</h3></div>
                <Activity size={22} />
              </div>
              {!latest ? <p>No sensor readings available for this farm.</p> : (
                <div className="sensor-grid">
                  <div className="sensor-card"><Droplets size={21} /><span>Soil moisture</span><strong>{latest.soilMoisture}%</strong></div>
                  <div className="sensor-card"><Thermometer size={21} /><span>Temperature</span><strong>{latest.temperature}°C</strong></div>
                  <div className="sensor-card"><Wind size={21} /><span>Humidity</span><strong>{latest.humidity}%</strong></div>
                </div>
              )}
              {latest && <p className="timestamp">Last recorded: {formatDate(latest.recordedAt)}</p>}
            </article>
          </section>

          <section className="stats-grid sensor-analytics-grid">
            <article className="stat-card"><div className="stat-icon blue"><Droplets /></div><p>Average soil moisture</p><strong>{sensorStats ? `${sensorStats.averageMoisture}%` : '—'}</strong><span>Recorded readings</span></article>
            <article className="stat-card"><div className="stat-icon amber"><Thermometer /></div><p>Average temperature</p><strong>{sensorStats ? `${sensorStats.averageTemperature}°C` : '—'}</strong><span>Recorded readings</span></article>
            <article className="stat-card"><div className="stat-icon green"><Wind /></div><p>Average humidity</p><strong>{sensorStats ? `${sensorStats.averageHumidity}%` : '—'}</strong><span>Recorded readings</span></article>
            <article className="stat-card"><div className="stat-icon lime"><Activity /></div><p>Total readings</p><strong>{sensorStats?.totalReadings ?? 0}</strong><span>Stored for this farm</span></article>
          </section>

          <section className="panel sensor-history-panel">
            <div className="panel-heading">
              <div><p className="eyebrow">SENSOR ANALYTICS</p><h3>Sensor trends</h3><p className="muted">Changes over time for {selectedFarm?.name || 'the selected farm'}</p></div>
              <Activity size={22} />
            </div>
            {chartData.length < 2 ? <p>Add at least two sensor readings to see trends.</p> : (
              <div style={{ width: '100%', height: 320, marginTop: 16 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" hide />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Soil Moisture" stroke="#16a34a" connectNulls />
                    <Line type="monotone" dataKey="Temperature" stroke="#ea580c" connectNulls />
                    <Line type="monotone" dataKey="Humidity" stroke="#2563eb" connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          <section className="panel sensor-history-panel">
            <div className="panel-heading">
              <div><p className="eyebrow">SENSOR ANALYTICS</p><h3>Sensor history</h3><p className="muted">Historical readings for {selectedFarm?.name || 'the selected farm'}</p></div>
              <Activity size={22} />
            </div>
            {readings.length === 0 ? <p>No sensor history available for this farm yet.</p> : (
              <div className="history-table-wrapper">
                <table className="history-table">
                  <thead><tr><th>Recorded at</th><th>Soil moisture</th><th>Temperature</th><th>Humidity</th></tr></thead>
                  <tbody>
                    {readings.map(reading => (
                      <tr key={reading.id}>
                        <td>{formatDate(reading.recordedAt)}</td>
                        <td>{reading.soilMoisture}%</td>
                        <td>{reading.temperature}°C</td>
                        <td>{reading.humidity}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="content-grid lower-grid">
            <article className="panel">
              <div className="panel-heading"><div><p className="eyebrow">FIELD MANAGEMENT</p><h3>Crop records</h3></div><Leaf size={22} /></div>
              {crops.length === 0 ? <p>No crops registered for this farm yet.</p> : (
                <div className="crop-list">
                  {crops.map(crop => (
                    <div className="crop-row" key={crop.id}>
                      <div className="crop-symbol"><Sprout size={20} /></div>
                      <div className="crop-info">
                        <strong>{crop.name}</strong>
                        <span>{crop.variety || 'Variety not specified'}</span>
                        <small>Planting: {crop.plantingDate || 'Not set'} · Harvest: {crop.expectedHarvestDate || 'Not set'}</small>
                      </div>
                      <span className="status-pill">{crop.status || 'UNKNOWN'}</span>
                      <div className="crop-actions">
                        <button type="button" className="crop-action-button" onClick={() => editCrop(crop)}>Edit</button>
                        <button type="button" className="crop-action-button delete" onClick={() => deleteCrop(crop.id)} disabled={deletingCropId === crop.id}>
                          {deletingCropId === crop.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>

            <article className="panel">
              <div className="panel-heading"><div><p className="eyebrow">ATTENTION REQUIRED</p><h3>Active alerts</h3></div><AlertTriangle size={22} /></div>
              {alerts.length === 0 ? <p className="empty-state">No active alerts. All clear!</p> : (
                <div className="alert-list">
                  {alerts.map(alert => (
                    <div className="alert-row" key={alert.id}>
                      <AlertTriangle size={19} />
                      <div className="alert-content">
                        <strong>{alert.severity || 'ALERT'}</strong>
                        <p>{alert.message}</p>
                        <small>{formatDate(alert.createdAt || alert.recordedAt)}</small>
                        <button type="button" className="resolve-button" onClick={() => resolveAlert(alert.id)} disabled={resolvingAlertId !== null}>
                          {resolvingAlertId === alert.id ? 'Resolving...' : 'Resolve alert'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>

            <article className="panel">
              <div className="panel-heading"><div><p className="eyebrow">MANUAL INPUT</p><h3>Record sensor reading</h3></div><Activity size={22} /></div>
              <form onSubmit={submitSensorReading} className="sensor-form">
                <label>Soil moisture (%)
                  <input type="number" min="0" max="100" step="0.1" required value={sensorForm.soilMoisture} onChange={event => setSensorForm({ ...sensorForm, soilMoisture: event.target.value })} />
                </label>
                <label>Temperature (°C)
                  <input type="number" step="0.1" required value={sensorForm.temperature} onChange={event => setSensorForm({ ...sensorForm, temperature: event.target.value })} />
                </label>
                <label>Humidity (%)
                  <input type="number" min="0" max="100" step="0.1" required value={sensorForm.humidity} onChange={event => setSensorForm({ ...sensorForm, humidity: event.target.value })} />
                </label>
                <button className="resolve-button" type="submit" disabled={savingReading || !selectedFarmId}>{savingReading ? 'Saving...' : 'Save reading'}</button>
                {sensorMessage && <p role="status">{sensorMessage}</p>}
              </form>
            </article>
          </section>
        </>
      )}

      <section className="content-grid">
        <article className="panel">
          <div className="panel-heading"><div><p className="eyebrow">FIELD MANAGEMENT</p><h3>{editingCropId ? 'Edit crop' : 'Add a crop'}</h3></div><Sprout size={22} /></div>
          <form id="crop-form" onSubmit={submitCrop} className="sensor-form">
            <label>Crop name
              <input value={cropForm.name} onChange={event => setCropForm({ ...cropForm, name: event.target.value })} placeholder="e.g. Maize" required />
            </label>
            <label>Variety
              <input value={cropForm.variety} onChange={event => setCropForm({ ...cropForm, variety: event.target.value })} placeholder="e.g. ZM 309" />
            </label>
            <label>Farm
              <select value={cropForm.farmId} onChange={event => setCropForm({ ...cropForm, farmId: event.target.value })} required>
                <option value="">Select a farm</option>
                {farms.map(item => <option key={item.id} value={String(item.id)}>{item.name}</option>)}
              </select>
            </label>
            <label>Planting date
              <input type="date" value={cropForm.plantingDate} onChange={event => setCropForm({ ...cropForm, plantingDate: event.target.value })} />
            </label>
            <label>Expected harvest date
              <input type="date" value={cropForm.expectedHarvestDate} onChange={event => setCropForm({ ...cropForm, expectedHarvestDate: event.target.value })} />
            </label>
            <label>Status
              <select value={cropForm.status} onChange={event => setCropForm({ ...cropForm, status: event.target.value })}>
                <option value="PLANNED">Planned</option>
                <option value="PLANTED">Planted</option>
                <option value="GROWING">Growing</option>
                <option value="HARVESTED">Harvested</option>
              </select>
            </label>
            <div className="form-actions">
              <button className="resolve-button" type="submit" disabled={savingCrop || farms.length === 0}>
                {savingCrop ? 'Saving crop...' : editingCropId ? 'Update crop' : 'Add crop'}
              </button>
              {editingCropId !== null && <button className="crop-action-button" type="button" onClick={cancelCropEdit}>Cancel edit</button>}
            </div>
            {cropMessage && <p role="status">{cropMessage}</p>}
          </form>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="panel-heading"><div><p className="eyebrow">FARM MANAGEMENT</p><h3>Register a farm</h3></div><Sprout size={22} /></div>
          <form onSubmit={submitFarm} className="sensor-form">
            <label>Farm name
              <input value={farmForm.name} onChange={event => setFarmForm({ ...farmForm, name: event.target.value })} placeholder="e.g. My Family Farm" required />
            </label>
            <label>Location
              <input value={farmForm.location} onChange={event => setFarmForm({ ...farmForm, location: event.target.value })} placeholder="e.g. Katlehong, Gauteng" required />
            </label>
            <label>Size (hectares)
              <input type="number" min="0.01" step="0.01" value={farmForm.sizeInHectares} onChange={event => setFarmForm({ ...farmForm, sizeInHectares: event.target.value })} required />
            </label>
            <label>Soil type
              <select value={farmForm.soilType} onChange={event => setFarmForm({ ...farmForm, soilType: event.target.value })}>
                <option value="Loam">Loam</option>
                <option value="Clay">Clay</option>
                <option value="Sandy">Sandy</option>
                <option value="Silt">Silt</option>
                <option value="Chalky">Chalky</option>
                <option value="Peaty">Peaty</option>
              </select>
            </label>
            <button className="resolve-button" type="submit" disabled={savingFarm}>{savingFarm ? 'Registering...' : 'Register farm'}</button>
            {farmMessage && <p role="status">{farmMessage}</p>}
          </form>
        </article>
      </section>

      <footer>AgriMonitor · Smart Agriculture Platform</footer>
    </main>
  )
}

export default App
